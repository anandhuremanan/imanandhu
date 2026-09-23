/**
 * MV3 service worker. Owns the one WebSocket to the Cloudflare Worker.
 *
 * Why the connection lives here and not in the content script: there may be
 * several music.youtube.com tabs open, and the room only wants one owner. A
 * single socket in the service worker gives that for free, and it survives
 * navigation within a tab.
 *
 * Service-worker lifetime: since Chrome 116, WebSocket activity resets the
 * idle timer, so the heartbeat below keeps this alive on its own. The
 * chrome.alarms entry is a belt-and-braces revival in case the worker is torn
 * down anyway (Chrome's minimum alarm period is 30s, comfortably inside the
 * server's 60s owner timeout).
 */

import { HEARTBEAT_INTERVAL_MS, type ServerMessage } from '../../worker/src/protocol';
import {
	loadSettings,
	type ConnectionStatus,
	type RuntimeMessage,
	type StatusResponse
} from './messages';
import { IDLE_SNAPSHOT, type PlayerSnapshot } from './snapshot';

const KEEPALIVE_ALARM = 'now-playing-keepalive';
const MAX_BACKOFF_MS = 30_000;
const BASE_BACKOFF_MS = 1_000;

let socket: WebSocket | null = null;
let status: ConnectionStatus = 'disconnected';
let detail: string | null = null;
let attempts = 0;
let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

/** Last snapshot seen from a tab, re-sent on (re)connect so state is never lost. */
let pending: PlayerSnapshot | null = null;
let lastSentFingerprint = '';

function setStatus(next: ConnectionStatus, note: string | null = null): void {
	status = next;
	detail = note;
	// The options page may not be open; a failed send is expected.
	void chrome.runtime.sendMessage({ kind: 'status_changed' }).catch(() => {});
	updateBadge();
}

function updateBadge(): void {
	const colour = status === 'connected' ? '#2bf5c0' : status === 'error' ? '#fb7185' : '#83838e';
	void chrome.action.setBadgeBackgroundColor({ color: colour });
	void chrome.action.setBadgeText({ text: status === 'connected' ? '' : '!' });
}

function clearTimers(): void {
	if (heartbeatTimer !== undefined) clearInterval(heartbeatTimer);
	if (reconnectTimer !== undefined) clearTimeout(reconnectTimer);
	heartbeatTimer = undefined;
	reconnectTimer = undefined;
}

function scheduleReconnect(): void {
	if (reconnectTimer !== undefined) return;
	// Exponential backoff with jitter so a worker outage does not turn every
	// browser into a retry storm.
	const delay = Math.min(BASE_BACKOFF_MS * 2 ** attempts, MAX_BACKOFF_MS);
	const jittered = delay * (0.5 + Math.random() * 0.5);
	attempts++;
	reconnectTimer = setTimeout(() => {
		reconnectTimer = undefined;
		void connect();
	}, jittered);
}

function send(payload: unknown): boolean {
	if (socket?.readyState !== WebSocket.OPEN) return false;
	try {
		socket.send(JSON.stringify(payload));
		return true;
	} catch {
		return false;
	}
}

function fingerprint(s: PlayerSnapshot): string {
	return [s.playing, s.title, s.artist, s.album, s.artwork, s.url].join('\u0000');
}

function publish(snapshot: PlayerSnapshot, force = false): void {
	const fp = fingerprint(snapshot);
	if (!force && fp === lastSentFingerprint) return;

	const ok = send({
		type: 'now_playing',
		playing: snapshot.playing,
		title: snapshot.title,
		artist: snapshot.artist,
		album: snapshot.album,
		artwork: snapshot.artwork,
		url: snapshot.url,
		timestamp: Date.now()
	});

	// Only mark as sent if it actually went out, so a reconnect re-publishes.
	if (ok) lastSentFingerprint = fp;
}

async function connect(): Promise<void> {
	const { wsUrl, ownerToken } = await loadSettings();

	if (!wsUrl || !ownerToken) {
		setStatus('error', 'Set the worker URL and owner token in options.');
		return;
	}

	// Drop any half-open socket before opening another.
	if (socket && socket.readyState <= WebSocket.OPEN) {
		try {
			socket.close(1000, 'reconnecting');
		} catch {
			/* already gone */
		}
	}
	clearTimers();
	setStatus('connecting');

	let ws: WebSocket;
	try {
		ws = new WebSocket(wsUrl);
	} catch {
		setStatus('error', 'Invalid WebSocket URL.');
		return;
	}
	socket = ws;

	ws.addEventListener('open', () => {
		if (socket !== ws) return;
		setStatus('authenticating');
		send({ type: 'auth', role: 'owner', token: ownerToken });
	});

	ws.addEventListener('message', (event) => {
		if (socket !== ws) return;
		let message: ServerMessage;
		try {
			message = JSON.parse(String(event.data)) as ServerMessage;
		} catch {
			return;
		}

		if (message.type === 'auth_ok') {
			attempts = 0;
			setStatus('connected');
			lastSentFingerprint = '';
			// Re-publish whatever the tabs last told us, so reconnecting mid-song
			// restores the banner immediately instead of after the next change.
			//
			// With nothing to report we must still say so explicitly. Being
			// connected as owner suppresses the server's staleness timeout, so
			// staying silent would pin the room to whatever was published last —
			// the banner would show a stale track for as long as the browser is
			// open with no YouTube Music tab in it.
			publish(pending ?? IDLE_SNAPSHOT, true);
			startHeartbeat();
			return;
		}

		if (message.type === 'error') {
			if (message.code === 'unauthorized') {
				// A wrong token will never fix itself; stop hammering the worker.
				setStatus('error', 'Owner token rejected. Check the options page.');
				clearTimers();
				try {
					ws.close(1000, 'unauthorized');
				} catch {
					/* ignore */
				}
				socket = null;
				return;
			}
			if (message.code === 'replaced') {
				setStatus('error', 'Replaced by another owner connection.');
				return;
			}
			setStatus('error', message.message);
		}
	});

	ws.addEventListener('close', () => {
		if (socket !== ws) return;
		socket = null;
		clearTimers();
		// 'error' from a rejected token is terminal and already handled above.
		if (status !== 'error' || detail?.startsWith('Replaced')) {
			setStatus('disconnected');
			scheduleReconnect();
		}
	});

	ws.addEventListener('error', () => {
		if (socket !== ws) return;
		setStatus('error', 'Connection failed.');
		// 'close' always follows 'error'; reconnect is scheduled there.
	});
}

function startHeartbeat(): void {
	if (heartbeatTimer !== undefined) clearInterval(heartbeatTimer);
	heartbeatTimer = setInterval(() => {
		if (!send({ type: 'heartbeat', timestamp: Date.now() })) {
			clearTimers();
			scheduleReconnect();
		}
	}, HEARTBEAT_INTERVAL_MS);
}

/* ------------------------------------------------------------------ *
 * Wiring
 * ------------------------------------------------------------------ */

chrome.runtime.onMessage.addListener((raw, _sender, respond) => {
	const message = raw as RuntimeMessage & { kind?: string };

	if (message.kind === 'snapshot') {
		pending = message.snapshot;
		if (socket?.readyState === WebSocket.OPEN && status === 'connected') {
			publish(message.snapshot);
		} else {
			void connect();
		}
		return false;
	}

	if (message.kind === 'status') {
		void loadSettings().then((s) => {
			const response: StatusResponse = {
				status,
				detail,
				lastTitle: pending?.playing ? pending.title : null,
				configured: Boolean(s.wsUrl && s.ownerToken)
			};
			respond(response);
		});
		return true; // async response
	}

	if (message.kind === 'reconnect') {
		attempts = 0;
		lastSentFingerprint = '';
		void connect();
		return false;
	}

	return false;
});

chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name !== KEEPALIVE_ALARM) return;
	// Revive the socket if the worker was torn down while a track was playing.
	if (socket?.readyState !== WebSocket.OPEN) void connect();
});

function bootstrap(): void {
	void chrome.alarms.create(KEEPALIVE_ALARM, { periodInMinutes: 0.5 });
	void connect();
}

chrome.runtime.onStartup.addListener(bootstrap);
chrome.runtime.onInstalled.addListener(bootstrap);

// Also run on plain service-worker revival (neither event above fires then).
bootstrap();
