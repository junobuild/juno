import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { findHtmlFiles } from './build.utils.mjs';

const OUTPUT_DIR = join(process.cwd(), 'build');
const SITE_ROOT_CANONICAL = 'https://console.juno.build';

const updateCanonical = (htmlFilePath) => {
	// 1. We determine the route based on the output
	const routePath = dirname(relative(OUTPUT_DIR, htmlFilePath));

	// 2. Build the effective canonical route
	const canonicalPath = `${SITE_ROOT_CANONICAL}/${routePath}/`;

	// 2. Read content
	let html = readFileSync(htmlFilePath, 'utf-8');

	// 3. Update canonical
	html = html.replace(
		`<link href="${SITE_ROOT_CANONICAL}" rel="canonical" />`,
		`<link href="${canonicalPath}" rel="canonical" />`
	);

	// 4. Update og:url to reflect the canonical
	html = html.replace(
		`<meta content="${SITE_ROOT_CANONICAL}" property="og:url" />`,
		`<meta content="${canonicalPath}" property="og:url" />`
	);

	// 5. Save the content with the updated canonical URL
	writeFileSync(htmlFilePath, html);
};

// Do not replace canonical for root and 404 pages
const filterSubPages = (htmlFile) => dirname(htmlFile) !== OUTPUT_DIR;

const htmlFiles = findHtmlFiles().filter(filterSubPages);
htmlFiles.forEach(updateCanonical);
