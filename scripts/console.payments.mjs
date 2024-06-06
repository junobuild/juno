#!/usr/bin/env node

import { jsonReplacer } from '@dfinity/utils';
import { writeFile } from 'fs/promises';
import { join } from 'node:path';
import { consoleActorIC, consoleActorLocal } from './actor.mjs';

/**
 * A temporary script used to backup the payments of the console as we aim to migrate those from heap to stable.
 * @param mainnet
 * @returns {Promise<void>}
 */
const savePayments = async (mainnet) => {
	const actor = await (mainnet ? consoleActorIC() : consoleActorLocal());

	const payments = await actor.list_payments();

	await writeFile(
		join(process.cwd(), 'console.payments.json', JSON.stringify(payments, jsonReplacer, 2))
	);
};

const mainnet = process.argv.find((arg) => arg.indexOf(`--mainnet`) > -1) !== undefined;

await savePayments(mainnet);
