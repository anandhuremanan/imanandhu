/**
 * ISOLATED-world content script.
 *
 * The MAIN-world extractor cannot reach chrome.* APIs, and the service worker
 * cannot reach the page's DOM, so this is the bridge between them. It does no
 * extraction of its own.
 */

import { BRIDGE_MESSAGE, IDLE_SNAPSHOT, type PlayerSnapshot } from './snapshot';
import type { SnapshotMessage } from './messages';

function isSnapshotEvent(event: MessageEvent): event is MessageEvent<{
	source: string;
	snapshot: PlayerSnapshot;
}> {
	// Only trust messages this window posted to itself. Anything cross-frame or
	// from another origin is ignored — the page is third-party code.
	if (event.source !== window) return false;
	const data = event.data as { source?: unknown } | null;
	return Boolean(data) && data?.source === BRIDGE_MESSAGE;
}

window.addEventListener('message', (event: MessageEvent) => {
	if (!isSnapshotEvent(event)) return;

	const message: SnapshotMessage = {
		kind: 'snapshot',
		snapshot: event.data.snapshot
	};

	// The service worker may be asleep; a failed send is not worth surfacing,
	// it will be re-sent by the next change or the 10s backstop.
	void chrome.runtime.sendMessage(message).catch(() => {});
});

/**
 * Tell the worker this tab is going away so it can publish "not playing"
 * without waiting for the heartbeat to expire.
 */
window.addEventListener('pagehide', () => {
	const message: SnapshotMessage = {
		kind: 'snapshot',
		snapshot: IDLE_SNAPSHOT
	};
	void chrome.runtime.sendMessage(message).catch(() => {});
});
