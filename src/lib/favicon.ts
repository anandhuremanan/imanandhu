import { THEMES, type ThemeKey } from './kerala';

/**
 * The site mark: a sun over a horizon, positioned by the time of day.
 *
 * Drawn on a 32-unit grid with the shapes on whole and half units, so it stays
 * crisp when a browser renders it at 16px in a tab. Three elements only — tile,
 * disc, horizon — because anything finer disappears at that size.
 *
 * Dawn and dusk share almost the same geometry on purpose; their palettes are
 * so different (warm cream vs burnt orange) that the colour does the telling,
 * and the small difference in the sun's height reads as rising vs setting.
 */

interface Sun {
	/** Centre y of the disc on the 32 grid. */
	cy: number;
	r: number;
	/** Night only: the offset circle that bites the disc into a crescent. */
	crescent?: { cx: number; cy: number; r: number };
}

const HORIZON_Y = 21;

const SUN: Record<ThemeKey, Sun> = {
	// Rising: most of the disc is above the line.
	dawn: { cy: 19, r: 5 },
	// High overhead, clear of the horizon entirely.
	day: { cy: 12, r: 5.5 },
	// Setting: the line cuts across the upper third of the disc.
	dusk: { cy: 22.5, r: 5 },
	// A moon rather than a sun, bitten by a second disc in the tile colour.
	night: { cy: 12, r: 5.5, crescent: { cx: 19.5, cy: 9.5, r: 5 } }
};

export function faviconSvg(theme: ThemeKey): string {
	const { bg, fg, accent } = THEMES[theme];
	const sun = SUN[theme];

	// The horizon is painted last so a low sun sits behind it.
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">`,
		`<rect width="32" height="32" rx="7" fill="${bg}"/>`,
		`<circle cx="16" cy="${sun.cy}" r="${sun.r}" fill="${accent}"/>`,
		sun.crescent
			? `<circle cx="${sun.crescent.cx}" cy="${sun.crescent.cy}" r="${sun.crescent.r}" fill="${bg}"/>`
			: '',
		`<path d="M5 ${HORIZON_Y}h22" stroke="${fg}" stroke-width="2" stroke-linecap="round"/>`,
		`</svg>`
	].join('');
}

/**
 * The same mark as a `data:` URI for `<link rel="icon">`.
 *
 * encodeURIComponent rather than base64: the palette is full of `#` characters,
 * which would terminate the URI, and percent-encoding keeps the markup readable
 * in devtools.
 */
export function faviconHref(theme: ThemeKey): string {
	return `data:image/svg+xml,${encodeURIComponent(faviconSvg(theme))}`;
}
