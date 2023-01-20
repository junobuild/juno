#!/usr/bin/env node

import { existsSync, readdirSync } from 'fs';
import { readFile, rename, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * We have to manipulate the types as long as https://github.com/dfinity/sdk/discussions/2761 is not implemented
 */
const cleanTypes = async ({ dest = `./src/declarations` }) => {
	const promises = readdirSync(dest).map(
		(dir) =>
			new Promise(async (resolve) => {
				const indexPath = join(dest, dir, 'index.js');

				if (!existsSync(indexPath)) {
					resolve();
					return;
				}

				const content = await readFile(indexPath, 'utf-8');
				const clean = content.replace(
					/export const canisterId = process\.env\.\w*_CANISTER_ID;/g,
					''
				);

				await writeFile(indexPath, clean, 'utf-8');

				resolve();
			})
	);

	await Promise.all(promises);
};

const renameFactory = async ({ dest = `./src/declarations` }) => {
	const promises = readdirSync(dest).map(
		(dir) =>
			new Promise(async (resolve) => {
				const factoryPath = join(dest, dir, `${dir}.did.js`);
				const formattedPath = join(dest, dir, `${dir}.factory.did.js`);

				if (!existsSync(factoryPath)) {
					resolve();
					return;
				}

				await rename(factoryPath, formattedPath);

				resolve();
			})
	);

	await Promise.all(promises);
};

(async () => {
	try {
		await cleanTypes({});

		await renameFactory({});

		console.log(`Types declarations copied!`);
	} catch (err) {
		console.error(`Error while copying the types declarations.`, err);
	}
})();
