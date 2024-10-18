#!/usr/bin/env node

import { CMCCanister } from '@dfinity/cmc';
import { jsonReplacer } from '@dfinity/utils';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { icAnonymousAgent } from './actor.mjs';
import { CMC_ID } from './constants.mjs';

const DATA_FOLDER = join(process.cwd(), 'src', 'frontend', 'src', 'lib', 'env');

if (!existsSync(DATA_FOLDER)) {
	mkdirSync(DATA_FOLDER, { recursive: true });
}

const listSubnets = async () => {
	const agent = await icAnonymousAgent();

	const { getDefaultSubnets } = CMCCanister.create({
		agent,
		canisterId: CMC_ID
	});

	return await getDefaultSubnets({ certified: true });
};

const writeSubnets = async (subnets) => {
	const subnetsList = subnets.map((principal) => ({
		subnetId: principal.toText()
	}));

	writeFileSync(join(DATA_FOLDER, 'subnets.json'), JSON.stringify(subnetsList, jsonReplacer, 8));
};

const subnets = await listSubnets();

await writeSubnets(subnets);
