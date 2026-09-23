import type { PlayerSnapshot } from './snapshot';

/** Content script -> service worker. */
export interface SnapshotMessage {
	kind: 'snapshot';
	snapshot: PlayerSnapshot;
}

/** Options/popup -> service worker. */
export interface StatusRequest {
	kind: 'status';
}

export interface ReconnectRequest {
	kind: 'reconnect';
}

export type RuntimeMessage = SnapshotMessage | StatusRequest | ReconnectRequest;

export type ConnectionStatus =
	| 'disconnected'
	| 'connecting'
	| 'authenticating'
	| 'connected'
	| 'error';

/** Service worker -> options/popup. */
export interface StatusResponse {
	status: ConnectionStatus;
	detail: string | null;
	lastTitle: string | null;
	configured: boolean;
}

export interface Settings {
	wsUrl: string;
	ownerToken: string;
}

/**
 * Development defaults. The token is intentionally a placeholder — a real one
 * must never be committed. `wrangler dev` serves the worker on 8787.
 */
export const DEFAULT_SETTINGS: Settings = {
	wsUrl: 'ws://127.0.0.1:8787/ws',
	ownerToken: ''
};

export async function loadSettings(): Promise<Settings> {
	const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
	return {
		wsUrl: String(stored.wsUrl || DEFAULT_SETTINGS.wsUrl).trim(),
		ownerToken: String(stored.ownerToken || '').trim()
	};
}

export async function saveSettings(settings: Settings): Promise<void> {
	await chrome.storage.local.set(settings);
}
