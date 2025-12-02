#!/usr/bin/env node

import { existsSync, readdirSync } from 'node:fs';
import { rename } from 'node:fs/promises';
import { join } from 'node:path';

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

try {
	await renameFactory({});
	await renameFactory({ dest: './src/tests/declarations' });

	console.log('Declarations renamed to factories!');
} catch (err) {
	console.error('Error while renaming the types declarations.', err);
}
