#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [moduleName, moduleVersion] = process.argv.slice(2);

const metadataFilePath = join(process.cwd(), 'target', 'deploy', 'metadata.json');

const readMetadataFile = async () => {
	try {
		return JSON.parse(await readFile(metadataFilePath, 'utf8'));
	} catch (_error) {
		return {};
	}
};

const updateMetadata = async () => {
	const metadata = await readMetadataFile();

	const updateMetadata = {
		...metadata,
		[moduleName]: moduleVersion
	};

	await writeFile(metadataFilePath, JSON.stringify(updateMetadata, null, 2), 'utf8');
};

await updateMetadata();
