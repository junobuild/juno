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

const listSubnetIds = async () => {
	const agent = await icAnonymousAgent();

	const { getDefaultSubnets } = CMCCanister.create({
		agent,
		canisterId: CMC_ID
	});

	return await getDefaultSubnets({ certified: true });
};

const listSubnets = async () => {
	const response = await fetch('https://ic-api.internetcomputer.org/api/v3/subnets');

	if (!response.ok) {
		throw new Error('Fetching the Dashboard API failed!');
	}

	return await response.json();
};

const writeSubnets = (subnets) => {
	writeFileSync(join(DATA_FOLDER, 'subnets.json'), JSON.stringify(subnets, jsonReplacer, 8));
};

const subnetIds = await listSubnetIds();

const { subnets: subnetsMetadata } = await listSubnets();

const subnets = subnetIds.map((sId) => {
	const subnetId = sId.toText();
	const metadata = subnetsMetadata.find(({ subnet_id }) => subnet_id === subnetId);

	return {
		subnetId,
		type: metadata?.subnet_type,
		specialization: metadata?.subnet_specialization
	};
});

writeSubnets(subnets);
