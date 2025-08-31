#!/usr/bin/env node

import { notEmptyString } from '@dfinity/utils';
import { downloadFromURL } from '@junobuild/cli-tools';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const AAGUIDS_JSON_FILE =
	'/passkeydeveloper/passkey-authenticator-aaguids/refs/heads/main/aaguid.json';

const data = await downloadFromURL({
	hostname: 'raw.githubusercontent.com',
	path: AAGUIDS_JSON_FILE,
	headers: {
		'Accept-Encoding': 'identity'
	}
});
const json = JSON.parse(data.toString('utf-8'));

const STATIC_DEST_FOLDER = join(process.cwd(), 'src/frontend/static/aaguids');
const ENV_DEST_FOLDER = join(process.cwd(), 'src/frontend/src/lib/env');

const saveIcon = async ({ aaguid, theme, base64Svg }) => {
	const svg = atob(base64Svg.replace(/data:image\/svg\+xml;base64,/, ''));

	const dest = join(STATIC_DEST_FOLDER, `${aaguid}-${theme}.svg`);

	await writeFile(dest, svg, 'utf-8');
};

const saveIcons = async ({ aaguid, value }) => {
	const { icon_dark, icon_light } = value;

	await Promise.all([
		...(notEmptyString(icon_dark)
			? [saveIcon({ aaguid, theme: 'dark', base64Svg: icon_dark })]
			: []),
		...(notEmptyString(icon_light)
			? [saveIcon({ aaguid, theme: 'light', base64Svg: icon_light })]
			: [])
	]);
};

const entries = Object.entries(json);

await Promise.all(entries.map(([key, value]) => saveIcons({ aaguid: key, value })));

const destJson = join(ENV_DEST_FOLDER, 'aaguids.json');
const cleanJson = entries.reduce((acc, [key, value]) => {
	const { name } = value;

	return {
		...acc,
		[key]: name
	};
}, {});
await writeFile(destJson, JSON.stringify(cleanJson, null, 2), 'utf-8');
