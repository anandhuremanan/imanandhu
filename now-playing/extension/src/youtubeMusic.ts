/**
 * MAIN-world content script for music.youtube.com.
 *
 * Runs in the page's own JavaScript context (not the isolated extension world)
 * because the primary data source is `navigator.mediaSession.metadata`, which
 * the page populates and which is not shared across worlds.
 *
 * Extraction is layered deliberately:
 *
 *   1. navigator.mediaSession  — an API contract YouTube Music must keep working
 *      for OS media keys and the system now-playing panel. Survives DOM
 *      refactors, which CSS selectors do not.
 *   2. the <video> element     — `paused`/`ended` is the ground truth for
 *      playback state, far more reliable than reading a button's label.
 *   3. ytmusic-player-bar DOM  — last resort, and only for fields the first two
 *      could not supply.
 *
 * Nothing here talks to the extension APIs; it posts to the isolated content
 * script over window.postMessage.
 */

import { BRIDGE_MESSAGE, IDLE_SNAPSHOT as IDLE, type PlayerSnapshot } from './snapshot';

function text(node: Element | null | undefined): string | null {
	const value = node?.textContent?.replace(/\s+/g, ' ').trim();
	return value ? value : null;
}

/**
 * YouTube serves thumbnails at the size named in the URL, and the player bar
 * asks for a ~60px one. Ask for something that survives a retina card.
 */
function upscaleArtwork(url: string | null): string | null {
	if (!url) return null;
	return url
		.replace(/=w\d+-h\d+/, '=w320-h320')
		.replace(/\/w\d+-h\d+\//, '/w320-h320/')
		.replace(/=s\d+/, '=s320');
}

function largestArtwork(images: readonly MediaImage[] | undefined): string | null {
	if (!images?.length) return null;
	let best: MediaImage | undefined;
	let bestArea = -1;
	for (const image of images) {
		// `sizes` looks like "512x512"; missing or odd values sort to the back.
		const match = /(\d+)x(\d+)/.exec(image.sizes ?? '');
		const area = match ? Number(match[1]) * Number(match[2]) : 0;
		if (area > bestArea) {
			bestArea = area;
			best = image;
		}
	}
	return best?.src ?? null;
}

/** Layer 1: the media session metadata. */
function fromMediaSession(): Partial<PlayerSnapshot> {
	const metadata = navigator.mediaSession?.metadata;
	if (!metadata) return {};
	return {
		title: metadata.title || null,
		artist: metadata.artist || null,
		album: metadata.album || null,
		artwork: upscaleArtwork(largestArtwork(metadata.artwork))
	};
}

/** Layer 2: the media element. Returns null when no player exists yet. */
function fromVideo(): boolean | null {
	// YouTube Music keeps exactly one <video>; guard anyway.
	const video = document.querySelector('video');
	if (!video) return null;
	return !video.paused && !video.ended;
}

/**
 * Splits the player bar byline, which is "Artist • Album • Year" for songs and
 * "Channel • 1.2M views" for uploaded videos.
 */
function parseByline(byline: string | null): { artist: string | null; album: string | null } {
	if (!byline) return { artist: null, album: null };
	const parts = byline
		.split('•')
		.map((p) => p.trim())
		.filter(Boolean);
	if (!parts.length) return { artist: null, album: null };

	const artist = parts[0] ?? null;
	let album: string | null = null;

	if (parts.length >= 2) {
		const candidate = parts[1] ?? '';
		const isYear = /^\d{4}$/.test(candidate);
		const isCount = /^[\d.,]+[KMB]?\s+(views|plays|listeners)$/i.test(candidate);
		if (!isYear && !isCount) album = candidate;
	}

	return { artist, album };
}

/** Layer 3: the player bar markup. Only consulted for gaps. */
function fromPlayerBar(): Partial<PlayerSnapshot> {
	const bar = document.querySelector('ytmusic-player-bar');
	if (!bar) return {};

	const title = text(bar.querySelector('.title'));
	const { artist, album } = parseByline(text(bar.querySelector('.byline')));

	const image = bar.querySelector<HTMLImageElement>('img.image, img.yt-img-shadow');
	const link = bar.querySelector<HTMLAnchorElement>('a[href*="watch?v="]');

	return {
		title,
		artist,
		album,
		artwork: upscaleArtwork(image?.src ?? null),
		url: link?.href ?? null
	};
}

/** Best-effort permalink for the current track. */
function currentUrl(fallback: string | null): string | null {
	if (fallback) return fallback;
	try {
		const id = new URL(location.href).searchParams.get('v');
		if (id) return `https://music.youtube.com/watch?v=${encodeURIComponent(id)}`;
	} catch {
		/* location is always parseable in practice; ignore */
	}
	return null;
}

/**
 * Merges all three layers into one snapshot.
 *
 * Deliberately NOT exported: this file is bundled as a classic content script,
 * and any export turns the output into ESM, which Chrome refuses to parse.
 */
function readPlayerState(): PlayerSnapshot {
	const playing = fromVideo();
	if (playing === null) return { ...IDLE };

	const session = fromMediaSession();
	const bar = fromPlayerBar();

	const title = session.title ?? bar.title ?? null;
	// No title means the player is mid-transition; report idle rather than
	// publishing a half-populated track.
	if (!title) return { ...IDLE, playing: false };

	return {
		playing,
		title,
		artist: session.artist ?? bar.artist ?? null,
		album: session.album ?? bar.album ?? null,
		artwork: session.artwork ?? bar.artwork ?? null,
		url: currentUrl(bar.url ?? null)
	};
}

/* ------------------------------------------------------------------ *
 * Change detection
 * ------------------------------------------------------------------ */

function fingerprint(s: PlayerSnapshot): string {
	return [s.playing, s.title, s.artist, s.album, s.artwork, s.url].join('\u0000');
}

function start(): void {
	let last = '';

	const publish = (): void => {
		let snapshot: PlayerSnapshot;
		try {
			snapshot = readPlayerState();
		} catch {
			// A DOM change that breaks an assumption must not kill the observer.
			return;
		}

		const next = fingerprint(snapshot);
		if (next === last) return;
		last = next;

		window.postMessage({ source: BRIDGE_MESSAGE, snapshot }, location.origin);
	};

	// Coalesce bursts: YouTube Music mutates the bar many times per track change.
	let timer: number | undefined;
	const schedule = (): void => {
		if (timer !== undefined) return;
		timer = window.setTimeout(() => {
			timer = undefined;
			publish();
		}, 400);
	};

	/** Attaches play/pause listeners to the <video> once it exists. */
	let wired: HTMLVideoElement | null = null;
	const wireVideo = (): void => {
		const video = document.querySelector('video');
		if (!video || video === wired) return;
		wired = video;
		for (const event of ['play', 'pause', 'ended', 'loadedmetadata', 'emptied']) {
			video.addEventListener(event, schedule, { passive: true });
		}
		schedule();
	};

	// The player bar is replaced wholesale on some navigations, so observe the
	// document and re-wire rather than holding a single node reference.
	const observer = new MutationObserver(() => {
		wireVideo();
		schedule();
	});
	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
		characterData: true
	});

	// SPA navigation: YouTube fires this, and history.pushState does not.
	window.addEventListener('yt-navigate-finish', schedule as EventListener);
	document.addEventListener('visibilitychange', schedule);

	// Low-frequency backstop for anything the observers miss. Deliberately slow:
	// the event-driven paths above carry the real load.
	window.setInterval(publish, 10_000);

	wireVideo();
	schedule();
}

start();
