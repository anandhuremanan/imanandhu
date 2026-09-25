/**
 * Everything the site's "Kerala time" theme is derived from.
 *
 * Pure and dependency-free so the server can compute the same theme the client
 * will, and render the correct colours in the very first byte of HTML. No
 * flash of the wrong palette on load.
 *
 * All times are IST (UTC+5:30) regardless of where the visitor is. That is the
 * whole point: the site shows *his* time of day, not theirs.
 */

export type ThemeKey = 'night' | 'dawn' | 'day' | 'dusk';

export interface Palette {
	bg: string;
	fg: string;
	muted: string;
	accent: string;
	line: string;
	card: string;
}

export const THEMES: Record<ThemeKey, Palette> = {
	night: {
		bg: '#0A0E1A',
		fg: '#E6E9F2',
		muted: '#98A0B5',
		accent: '#F5C451',
		line: '#262C3D',
		card: '#131A2C'
	},
	dawn: {
		bg: '#F4D6C0',
		fg: '#2A1A12',
		muted: '#5E4336',
		accent: '#A63A12',
		line: '#D9B39A',
		card: '#F8E4D4'
	},
	day: {
		bg: '#F3F1EA',
		fg: '#141413',
		muted: '#5E5C56',
		accent: '#1846D6',
		line: '#D6D3C9',
		card: '#FBFAF6'
	},
	dusk: {
		bg: '#D9542B',
		fg: '#170904',
		muted: '#3A1508',
		accent: '#FFF1DE',
		line: '#B8431F',
		card: '#E26A43'
	}
};

/** IST offset in minutes. */
const IST_OFFSET = 330;

/** Minutes past midnight in Kerala, 0–1439. */
export function istMinutes(from: Date = new Date()): number {
	return (from.getUTCHours() * 60 + from.getUTCMinutes() + IST_OFFSET) % 1440;
}

export function themeFor(hour: number): ThemeKey {
	if (hour < 5) return 'night';
	if (hour < 9) return 'dawn';
	if (hour < 17) return 'day';
	if (hour < 21) return 'dusk';
	return 'night';
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatClock(minutes: number): string {
	return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/**
 * The short form used on the case-studies and contact headers:
 * "09:41 in Kerala · probably shipping code".
 */
export function doingShort(hour: number): string {
	if (hour < 6) return 'asleep';
	if (hour < 9) return 'painting';
	if (hour < 13) return 'shipping code';
	if (hour < 14) return 'at lunch';
	if (hour < 18) return 'deep in a codebase';
	if (hour < 21) return 'making music';
	return 'writing stories';
}

/**
 * The home hero sentence, split so the middle can be a link. `pre` and `post`
 * are plain text; `link`/`href` are present only when that hour points at one
 * of the after-hours sites.
 */
export interface Doing {
	pre: string;
	post: string;
	link?: string;
	href?: string | null;
}

export function doingLong(
	hour: number,
	links: { paint: string | null; music: string; stories: string }
): Doing {
	if (hour < 6) return { pre: 'asleep. Leave a note, I’ll reply in the morning.', post: '' };
	if (hour < 9) {
		return { pre: '', link: 'painting', href: links.paint, post: ', before the laptop opens.' };
	}
	if (hour < 13) return { pre: 'shipping code.', post: '' };
	if (hour < 14) return { pre: 'at lunch. Rice, obviously.', post: '' };
	if (hour < 18) return { pre: 'deep inside someone’s codebase.', post: '' };
	if (hour < 21) return { pre: 'making ', link: 'music', href: links.music, post: '.' };
	return { pre: 'writing ', link: 'stories', href: links.stories, post: '.' };
}

/** The time-aware line under "Let's talk." on the contact page. */
export function contactNote(hour: number): string {
	if (hour < 6) return 'I’m asleep right now, but your message will be the first thing I read.';
	if (hour < 9) return 'I’m not at my desk yet. I’ll see this once the laptop opens.';
	if (hour < 18) return 'I’m at my desk, so there’s a good chance I see this today.';
	return 'I’m off the clock, but I’ll pick this up tomorrow.';
}

/** Which after-hours craft is happening at this hour, if any. */
export function activeCraft(hour: number): 'paint' | 'music' | 'stories' | null {
	if (hour >= 6 && hour < 9) return 'paint';
	if (hour >= 18 && hour < 21) return 'music';
	if (hour >= 21) return 'stories';
	return null;
}
