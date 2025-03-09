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
			// eslint-disable-next-line no-async-promise-executor
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

				const valid = clean.replace(/export const idlFactory = \({ IDL }\) => {/g, '');

				await writeFile(indexPath, valid, 'utf-8');

				resolve();
			})
	);

	await Promise.all(promises);
};

/**
 * We have to manipulate the factory otherwise the editor prompt for following TypeScript error:
 *
 * TS7031: Binding element 'IDL' implicitly has an 'any' type.
 *
 */
const cleanFactory = async ({ dest = `./src/declarations` }) => {
	const promises = readdirSync(dest).map(
		(dir) =>
			// eslint-disable-next-line no-async-promise-executor
			new Promise(async (resolve) => {
				const factoryPath = join(dest, dir, `${dir}.did.js`);

				if (!existsSync(factoryPath)) {
					resolve();
					return;
				}

				const content = await readFile(factoryPath, 'utf-8');
				const cleanFactory = content.replace(
					/export const idlFactory = \({ IDL }\) => {/g,
					`// @ts-ignore
export const idlFactory = ({ IDL }) => {`
				);
				const cleanInit = cleanFactory.replace(
					/export const init = \({ IDL }\) => {/g,
					`// @ts-ignore
export const init = ({ IDL }) => {`
				);

				await writeFile(factoryPath, cleanInit, 'utf-8');

				resolve();
			})
	);

	await Promise.all(promises);
};

const renameFactory = async ({ dest = `./src/declarations` }) => {
	const promises = readdirSync(dest).map(
		(dir) =>
			// eslint-disable-next-line no-async-promise-executor
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
		await cleanFactory({});
		await renameFactory({});

		await cleanTypes({ dest: './src/tests/declarations' });
		await cleanFactory({ dest: './src/tests/declarations' });
		await renameFactory({ dest: './src/tests/declarations' });

		console.log(`Types declarations copied!`);
	} catch (err) {
		console.error(`Error while copying the types declarations.`, err);
	}
})();
