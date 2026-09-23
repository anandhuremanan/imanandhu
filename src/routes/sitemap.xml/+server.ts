export const prerender = true;

const SITE = 'https://imanandhu.in';

/**
 * The case studies all live on one page behind fragments, so only the three
 * real routes are listed. Fragment URLs are not separate documents and search
 * engines ignore them in a sitemap.
 */
const routes = [
	{ path: '/', priority: '1.0', freq: 'monthly' },
	{ path: '/case-studies', priority: '0.9', freq: 'monthly' },
	{ path: '/contact', priority: '0.7', freq: 'yearly' }
];

export function GET() {
	const lastmod = new Date().toISOString().split('T')[0];

	const body = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map(
		(r) => `	<url>
		<loc>${SITE}${r.path}</loc>
		<lastmod>${lastmod}</lastmod>
		<changefreq>${r.freq}</changefreq>
		<priority>${r.priority}</priority>
	</url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
