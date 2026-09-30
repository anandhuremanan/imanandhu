/**
 * The site's Kerala-time palettes, trimmed to what an email needs.
 *
 * A local copy rather than an import: the Worker is its own package with its
 * own build, and reaching into `src/lib` would couple a deployable to the
 * site's module graph. Keep these values in step with src/lib/kerala.ts.
 *
 * The acknowledgement is themed by the hour it was sent, so the mail in
 * someone's inbox is coloured by what Kerala looked like when their message
 * arrived. Same idea as the site, fixed at one moment instead of ticking.
 */

export type ThemeKey = 'night' | 'dawn' | 'day' | 'dusk';

export interface Palette {
	bg: string;
	fg: string;
	muted: string;
	accent: string;
	line: string;
	card: string;
	/** Which side of the light/dark line this palette sits on. */
	scheme: 'light' | 'dark';
	/** One line describing the hour, used in the mail's opening. */
	moment: string;
}

export const THEMES: Record<ThemeKey, Palette> = {
	night: {
		bg: '#0A0E1A',
		fg: '#E6E9F2',
		muted: '#98A0B5',
		accent: '#F5C451',
		line: '#262C3D',
		card: '#131A2C',
		scheme: 'dark',
		moment: 'It is night here'
	},
	dawn: {
		bg: '#F4D6C0',
		fg: '#2A1A12',
		muted: '#5E4336',
		accent: '#A63A12',
		line: '#D9B39A',
		card: '#F8E4D4',
		scheme: 'light',
		moment: 'It is early morning here'
	},
	day: {
		bg: '#F3F1EA',
		fg: '#141413',
		muted: '#5E5C56',
		accent: '#1846D6',
		line: '#D6D3C9',
		card: '#FBFAF6',
		scheme: 'light',
		moment: 'It is the middle of the day here'
	},
	dusk: {
		bg: '#D9542B',
		fg: '#170904',
		muted: '#3A1508',
		accent: '#FFF1DE',
		line: '#B8431F',
		card: '#E26A43',
		scheme: 'light',
		moment: 'It is evening here'
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

export interface KeralaNow {
	theme: ThemeKey;
	palette: Palette;
	clock: string;
}

export function keralaNow(from: Date = new Date()): KeralaNow {
	const minutes = istMinutes(from);
	const theme = themeFor(Math.floor(minutes / 60));
	return { theme, palette: THEMES[theme], clock: formatClock(minutes) };
}
