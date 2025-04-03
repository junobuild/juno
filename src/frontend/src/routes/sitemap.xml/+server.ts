const url = 'https://console.juno.build/';

const staticPages: string[] = [];

export const prerender = true;

// eslint-disable-next-line require-await
export const GET = async (): Promise<Response> => {
	const headers: Record<string, string> = {
		'Cache-Control': 'max-age=3600',
		'Content-Type': 'application/xml'
	};

	return new Response(
		`<?xml version="1.0" encoding="UTF-8" ?>
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
    >
      <url>
        <loc>${url}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>
      ${staticPages
				.map(
					(path: string) => `<url>
        <loc>${url}${path}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`
				)
				.join('')}
    </urlset>`,
		{ headers }
	);
};
