/**
 * Types and constants shared between the MAIN-world extractor, the isolated
 * content script and the service worker.
 *
 * This module must stay free of side effects. `youtubeMusic.ts` starts
 * observers as soon as it is imported, so anything that merely needs the
 * *shape* of a snapshot imports from here instead — otherwise the extractor
 * gets bundled into the isolated world and runs a second time.
 */

export interface PlayerSnapshot {
	playing: boolean;
	title: string | null;
	artist: string | null;
	album: string | null;
	artwork: string | null;
	url: string | null;
}

/** Namespaced so page scripts and other extensions cannot be confused for us. */
export const BRIDGE_MESSAGE = 'imanandhu-now-playing/snapshot';

export const IDLE_SNAPSHOT: PlayerSnapshot = {
	playing: false,
	title: null,
	artist: null,
	album: null,
	artwork: null,
	url: null
};
