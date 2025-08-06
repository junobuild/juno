#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, parse, relative } from 'node:path';
import { findHtmlFiles } from './build.utils.mjs';

const buildCsp = (htmlFile) => {
	// 1. Read content
	const indexHtml = readFileSync(htmlFile, 'utf-8');

	// 2. Generate main.js script with hash to avoid collision
	const mainJs = generateMainScriptName({ fileContent: indexHtml, htmlFile });

	// 3. We extract the start script parsed by SvelteKit into the html file
	const indexHTMLWithoutStartScript = extractStartScript({ indexHtml, mainJs, htmlFile });

	// 4. We add our custom script loader - we inject it at build time because it would throw an error when developing locally if missing
	const indexHTMLWithScriptLoader = injectScriptLoader({
		indexHtml: indexHTMLWithoutStartScript,
		mainJs,
		htmlFile
	});

	// 5. Replace preloaders
	const indexHTMLWithPreloaders = injectLinkPreloader(indexHTMLWithScriptLoader);

	// 6. remove the content-security-policy tag injected by SvelteKit
	const indexHTMLNoCSP = removeDefaultCspTag(indexHTMLWithPreloaders);

	// 7. We calculate the sha256 values for these scripts and update the CSP
	const indexHTMLWithCSP = updateCSP(indexHTMLNoCSP);

	writeFileSync(htmlFile, indexHTMLWithCSP);
};

/**
 * The loader used to be called main.js, but we now include a hash and the file name
 * to avoid collisions — especially when multiple HTML files (like index and 404) exist in the same folder.
 *
 * That said, the 404 and index loaders are currently identical due to sharing the same layout, etc.
 */
const generateMainScriptName = ({ fileContent, htmlFile }) => {
	const hash = getHash({ text: fileContent });
	const { name } = parse(htmlFile);
	return `${name}.${hash}.js`;
};

/**
 * Generates a short, URL-safe hash from input text or buffer.
 * Based on Vite's internal hashing strategy (uses SHA-256 + base64url).
 * @link https://github.com/vitejs/vite/blob/main/packages/vite/src/node/utils.ts#L1095
 */
export const getHash = ({ text, length = 8 }) => {
	// TODO: Node v24
	// const h = crypto.hash('sha256', text, 'hex').substring(0, length);

	const hash = createHash('sha256').update(text).digest('base64url').slice(0, length);

	if (length <= 64) {
		return hash;
	}

	throw new Error(`File hash length (${length}) exceeds maximum safe length (64).`);
};

const removeDefaultCspTag = (indexHtml) =>
	indexHtml.replace('<meta http-equiv="content-security-policy" content="">', '');

/**
 * We need a script loader to implement a proper Content Security Policy. See `updateCSP` doc for more information.
 */
const injectScriptLoader = ({ indexHtml, htmlFile, mainJs }) => {
	// We need to provide the relative path to the script otherwise it will look for it at the root when loading it at runtime
	const parentFolders = relative(join(process.cwd(), 'build'), dirname(htmlFile));
	const loaderSrc = `${parentFolders !== '' ? `/${parentFolders}/` : ''}${mainJs}`;

	const scriptLoader = `<script sveltekit-loader>
      const loader = document.createElement("script");
      loader.type = "module";
      loader.src = "${loaderSrc}";
      document.head.appendChild(loader);
    </script>`;

	return indexHtml.replace('<!-- SCRIPT_LOADER -->', scriptLoader);
};

/**
 * Calculating the sh256 value for the preloaded link and whitelisting these seem not to be supported by the Content-Security-Policy.
 * Instead, we transform these in dynamic scripts and add the sha256 value of the script to the script-src policy of the CSP.
 */
const injectLinkPreloader = (indexHtml) => {
	const preload = /<link rel="preload"[\s\S]*?href="([\s\S]*?)">/gim;

	const links = [];

	let p;
	while ((p = preload.exec(indexHtml))) {
		const [linkTag, src] = p;

		links.push({
			linkTag,
			src
		});
	}

	// 1. Inject pre-loaders dynamically after load
	const loader = `<script sveltekit-preloader>
      const links = [${links.map(({ src }) => `'${src}'`)}];
      for (const link of links) {
          const preloadLink = document.createElement("link");
          preloadLink.href = link;
          preloadLink.rel = "preload";
          preloadLink.as = "script";
          document.head.appendChild(loader);
      }
    </script>`;

	let updateIndex = indexHtml.replace('<!-- LINKS_PRELOADER -->', loader);

	// 2. Remove original <link rel="preload" as="script" />
	for (const url of links) {
		const { linkTag } = url;
		updateIndex = updateIndex.replace(linkTag, '');
	}

	return updateIndex;
};

/**
 * Using a CSP with 'strict-dynamic' with SvelteKit breaks in Firefox.
 * Issue: https://github.com/sveltejs/kit/issues/3558
 *
 * As workaround:
 * 1. we extract the start script that is injected by SvelteKit in index.html into a separate main.js
 * 2. we remove the script content from index.html but, let the script tag as anchor
 * 3. we use our custom script loader to load the main.js script
 */
const extractStartScript = ({ indexHtml, mainJs, htmlFile }) => {
	const svelteKitStartScript = /(<script>)([\s\S]*?)(<\/script>)/gm;

	// 1. extract SvelteKit start script to a separate main.js file
	const [_script, _scriptStartTag, content, _scriptEndTag] = svelteKitStartScript.exec(indexHtml);
	const inlineScript = content.replace(/^\s*/gm, '');

	// Each file needs its own main.js because the script that calls the SvelteKit start function contains information dedicated to the route
	// i.e. the routeId and a particular id for the querySelector use to attach the content
	const folderPath = dirname(htmlFile);

	// 2. Extract the SvelteKit script into a separate file

	// We need to replace the document.currentScript.parentElement because the script is added to the head. SvelteKit except the <body /> element as initial parameter.
	// We also need to attach explicitly to the `window` the __sveltekit_ variables because they are not defined in the global scope but are used as global.
	const moduleScript = inlineScript
		.replaceAll('document.currentScript.parentElement', "document.querySelector('body')")
		.replaceAll(/__sveltekit_(.*)\s=/g, 'window.$&');

	writeFileSync(join(folderPath, mainJs), moduleScript, 'utf-8');

	// 3. Replace original SvelteKit script tag content with empty
	return indexHtml.replace(svelteKitStartScript, '$1$3');
};

/**
 * Inject "Content Security Policy" (CSP) into index.html for production build
 *
 * Note about the rules:
 *
 * - script-src 'unsafe-eval' is required because:
 * 1. agent-js uses a WebAssembly module for the validation of bls signatures.
 *    source: II https://github.com/dfinity/internet-identity/blob/c5709518ce3daaf7fdd9c7994120b66bd613f01b/src/internet_identity/src/main.rs#L824
 * 2. nns-js auto-generated proto js code (base_types_pb.js and ledger_pb.js) require 'unsafe-eval' as well
 *
 * - script-src and usage of 'integrity':
 * Ideally we would like to secure the scripts that are loaded with the 'integrity=sha256-...' hashes attributes - e.g. https://stackoverflow.com/a/68492689/5404186.
 * However, this is currently only supported by Chrome. Firefox issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1409200
 * To overcome this, we include within the index.html a first script which, when executed at app boot time, add a script that actually loads the main.js.
 * We generate the hash for that particular first script and set 'strict-dynamic' to trust those scripts that will be loaded per extension - the chunks used by the app.
 *
 * - script-src and 'strict-dynamic':
 * Chrome 40+ / Firefox 31+ / Safari 15.4+ / Edge 15+ supports 'strict-dynamic'.
 * Safari 15.4 has been released recently - March 15, 2022 - that's why we add 'unsafe-inline' to the rules for backwards compatibility.
 * Browsers that supports the 'strict-dynamic' rule will ignore these backwards directives (CSP 3).
 *
 * - style-src 'unsafe-inline' is required because:
 * 1. svelte uses inline style for animation (scale, fly, fade, etc.)
 *    source: https://github.com/sveltejs/svelte/issues/6662
 */
const updateCSP = (indexHtml) => {
	const sw = /<script[\s\S]*?>([\s\S]*?)<\/script>/gm;

	const indexHashes = [];

	let m;
	while ((m = sw.exec(indexHtml))) {
		const [_, content] = m;

		indexHashes.push(`'sha256-${createHash('sha256').update(content).digest('base64')}'`);
	}

	const JUNO_CDN = 'https://cdn.juno.build';

	const csp = `<meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none';
        connect-src 'self' https://ic0.app https://icp0.io https://icp-api.io https://*.icp0.io ${JUNO_CDN};
        img-src 'self' data:;
        child-src 'self';
        manifest-src 'self';
        script-src 'unsafe-eval' 'unsafe-inline' 'strict-dynamic' ${indexHashes.join(' ')} ${JUNO_CDN};
        base-uri 'self';
        form-action 'none';
        style-src 'self' 'unsafe-inline' ${JUNO_CDN};
        font-src 'self';
        upgrade-insecure-requests;"
    />`;

	return indexHtml.replace('<!-- CONTENT_SECURITY_POLICY -->', csp);
};

const htmlFiles = findHtmlFiles();
htmlFiles.forEach((htmlFile) => buildCsp(htmlFile));
