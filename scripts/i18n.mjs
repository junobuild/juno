#!/usr/bin/env node

import { writeFileSync } from 'node:fs';

/**
 * Generate the TypeScript interfaces from the english translation file.
 *
 * Note: only supports "a one child depth" in the data structure.
 */
const generateTypes = async () => {
	const en = await import('../src/frontend/src/lib/i18n/en.json', { assert: { type: 'json' } });

	const data = Object.keys(en.default).map((key) => {
		const properties = Object.keys(en.default[key]).map((prop) => `${prop}: string;`);

		return {
			key,
			name: `I18n${key.charAt(0).toUpperCase()}${key.slice(1)}`,
			properties
		};
	});

	const lang = `lang: Languages;`;

	const main = `\n\ninterface I18n {${lang}${data.map((i) => `${i.key}: ${i.name};`).join('')}}`;
	const interfaces = data.map((i) => `\n\ninterface ${i.name} {${i.properties.join('')}}`).join('');

	const comment = `/**\n* Auto-generated definitions file ("npm run i18n")\n*/`;

	const output = `${comment}${interfaces}${main}`;

	writeFileSync('./src/frontend/src/lib/types/i18n.d.ts', output);
};

await generateTypes();
