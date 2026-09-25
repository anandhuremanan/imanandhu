import type { Handle } from '@sveltejs/kit';
import { istMinutes, themeFor } from '$lib/kerala';

/**
 * Stamps the current Kerala theme onto <html> before the response is sent.
 *
 * Without this the page would paint in whatever palette happened to be in the
 * stylesheet and then snap to the right one on hydration — a full-screen
 * colour flash on every load, made worse by the 0.8s transition. Computing it
 * here costs nothing: it is arithmetic on the server clock, no I/O.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const theme = themeFor(Math.floor(istMinutes() / 60));

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%kerala.theme%', theme)
	});
};
