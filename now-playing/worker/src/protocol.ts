/**
 * The wire protocol shared by the Worker, the Chrome extension and the
 * portfolio. This module is deliberately dependency-free and has no Workers
 * runtime imports, so the extension bundles it directly and the tests import
 * it under plain Node.
 */

/** Fixed Durable Object room. There is exactly one. */
export const ROOM_NAME = 'portfolio-now-playing';

/** How often the owner extension should send a heartbeat. */
export const HEARTBEAT_INTERVAL_MS = 20_000;

/**
 * How long the room waits after the owner's last sign of life before it
 * declares nothing is playing. Must be comfortably larger than the heartbeat
 * interval so one dropped packet does not blank the banner.
 */
export const OWNER_TIMEOUT_MS = 60_000;

/** Anything larger is dropped unread — a now-playing frame is a few hundred bytes. */
export const MAX_MESSAGE_BYTES = 4096;

/** Per-field caps applied after parsing. Longer values are truncated, not rejected. */
export const MAX_TEXT_LEN = 300;
export const MAX_URL_LEN = 2048;

/**
 * Artwork is rendered as an <img src> on the portfolio, so the host is
 * restricted to the CDNs YouTube Music actually serves covers from. A
 * compromised or buggy extension therefore cannot point visitors' browsers at
 * an arbitrary origin. Unknown hosts drop the field rather than failing the
 * whole update.
 */
export const ALLOWED_ARTWORK_HOSTS = [
	'lh3.googleusercontent.com',
	'yt3.googleusercontent.com',
	'yt3.ggpht.com',
	'i.ytimg.com',
	'music.youtube.com'
];

const ALLOWED_LINK_HOSTS = ['music.youtube.com', 'www.youtube.com', 'youtu.be'];

export type Role = 'owner' | 'visitor';

export interface NowPlayingState {
	playing: boolean;
	title: string | null;
	artist: string | null;
	album: string | null;
	artwork: string | null;
	url: string | null;
	timestamp: number;
}

export const IDLE_STATE: NowPlayingState = {
	playing: false,
	title: null,
	artist: null,
	album: null,
	artwork: null,
	url: null,
	timestamp: 0
};

/* ------------------------------------------------------------------ *
 * Client -> server
 * ------------------------------------------------------------------ */

export interface AuthOwnerMessage {
	type: 'auth';
	role: 'owner';
	token: string;
}

export interface AuthVisitorMessage {
	type: 'auth';
	role: 'visitor';
}

export interface NowPlayingMessage {
	type: 'now_playing';
	playing: boolean;
	title: string | null;
	artist: string | null;
	album: string | null;
	artwork: string | null;
	url: string | null;
	timestamp: number;
}

export interface HeartbeatMessage {
	type: 'heartbeat';
	timestamp: number;
}

export type ClientMessage =
	| AuthOwnerMessage
	| AuthVisitorMessage
	| NowPlayingMessage
	| HeartbeatMessage;

/* ------------------------------------------------------------------ *
 * Server -> client
 * ------------------------------------------------------------------ */

export interface StateMessage extends NowPlayingState {
	type: 'state';
}

export interface AuthOkMessage {
	type: 'auth_ok';
	role: Role;
	heartbeatIntervalMs: number;
}

export type ErrorCode =
	| 'bad_json'
	| 'too_large'
	| 'bad_message'
	| 'unauthorized'
	| 'not_authenticated'
	| 'forbidden'
	| 'replaced';

export interface ErrorMessage {
	type: 'error';
	code: ErrorCode;
	message: string;
}

export type ServerMessage = StateMessage | AuthOkMessage | ErrorMessage;

/** Close codes. 4000+ is the application-defined range. */
export const CLOSE_UNAUTHORIZED = 4001;
export const CLOSE_REPLACED = 4002;

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

export type ParseResult =
	| { ok: true; message: ClientMessage }
	| { ok: false; code: ErrorCode; message: string };

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Trim, collapse whitespace, cap length. Returns null for anything empty. */
export function cleanText(value: unknown, max = MAX_TEXT_LEN): string | null {
	if (typeof value !== 'string') return null;
	// Strip control characters so a crafted title cannot smuggle newlines
	// into logs or break layout.
	const cleaned = value
		.replace(/[\u0000-\u001f\u007f]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (!cleaned) return null;
	return cleaned.length > max ? cleaned.slice(0, max) : cleaned;
}

function cleanUrl(value: unknown, allowedHosts: string[]): string | null {
	if (typeof value !== 'string') return null;
	if (value.length > MAX_URL_LEN) return null;
	let parsed: URL;
	try {
		parsed = new URL(value);
	} catch {
		return null;
	}
	// https only: blocks javascript:, data: and plaintext http.
	if (parsed.protocol !== 'https:') return null;
	if (!allowedHosts.includes(parsed.hostname)) return null;
	return parsed.toString();
}

export function cleanArtwork(value: unknown): string | null {
	return cleanUrl(value, ALLOWED_ARTWORK_HOSTS);
}

export function cleanLink(value: unknown): string | null {
	return cleanUrl(value, ALLOWED_LINK_HOSTS);
}

/**
 * Parses and sanitises one inbound frame. Everything that reaches the room is
 * already normalised, so the room logic never has to re-check shapes.
 */
export function parseClientMessage(raw: string): ParseResult {
	if (raw.length > MAX_MESSAGE_BYTES) {
		return { ok: false, code: 'too_large', message: 'Message exceeds size limit' };
	}

	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return { ok: false, code: 'bad_json', message: 'Message is not valid JSON' };
	}

	if (!isRecord(data) || typeof data.type !== 'string') {
		return { ok: false, code: 'bad_message', message: 'Message is missing a type' };
	}

	switch (data.type) {
		case 'auth': {
			if (data.role === 'owner') {
				if (typeof data.token !== 'string' || !data.token) {
					return { ok: false, code: 'bad_message', message: 'Owner auth requires a token' };
				}
				return { ok: true, message: { type: 'auth', role: 'owner', token: data.token } };
			}
			if (data.role === 'visitor') {
				return { ok: true, message: { type: 'auth', role: 'visitor' } };
			}
			return { ok: false, code: 'bad_message', message: 'Unknown auth role' };
		}

		case 'now_playing': {
			if (typeof data.playing !== 'boolean') {
				return { ok: false, code: 'bad_message', message: '"playing" must be a boolean' };
			}
			const title = cleanText(data.title);
			// A playing track with no title is meaningless and usually means the
			// extractor caught the player mid-transition.
			if (data.playing && !title) {
				return { ok: false, code: 'bad_message', message: 'A playing track needs a title' };
			}
			return {
				ok: true,
				message: {
					type: 'now_playing',
					playing: data.playing,
					title,
					artist: cleanText(data.artist),
					album: cleanText(data.album),
					artwork: cleanArtwork(data.artwork),
					url: cleanLink(data.url),
					timestamp: typeof data.timestamp === 'number' ? data.timestamp : 0
				}
			};
		}

		case 'heartbeat':
			return {
				ok: true,
				message: {
					type: 'heartbeat',
					timestamp: typeof data.timestamp === 'number' ? data.timestamp : 0
				}
			};

		default:
			return { ok: false, code: 'bad_message', message: `Unsupported type "${data.type}"` };
	}
}

/** Builds the public state frame. Never includes anything owner-only. */
export function stateMessage(state: NowPlayingState): StateMessage {
	return { type: 'state', ...state };
}
