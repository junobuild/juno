#!/usr/bin/env node

import { jsonReplacer, nonNullish } from '@dfinity/utils';
import { CMCCanister } from '@icp-sdk/canisters/cmc';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { icAnonymousAgent } from './actor.mjs';
import { CMC_ID } from './constants.mjs';

const DATA_FOLDER = join(process.cwd(), 'src', 'frontend', 'src', 'lib', 'env');

if (!existsSync(DATA_FOLDER)) {
	mkdirSync(DATA_FOLDER, { recursive: true });
}

/**
 * The list of subnets used by the CMC to create canisters randomly if no parameters are provided when creating a canister.
 * Which means that these are subnets that can also be used if a developer wants to specify a particular subnet.
 * @returns {Promise<Principal[]>}
 */
const listSubnetIds = async () => {
	const agent = await icAnonymousAgent();

	const { getDefaultSubnets } = CMCCanister.create({
		agent,
		canisterId: CMC_ID
	});

	return await getDefaultSubnets({ certified: true });
};

/**
 * The list of subnets supported by the CMC to create canisters only if specified,
 * i.e., those subnets are not used when creating a canister in a random subnet.
 * @returns {Promise<SubnetTypesToSubnetsResponse>}
 */
const listSpecifiedSubnetIds = async () => {
	const agent = await icAnonymousAgent();

	const { getSubnetTypesToSubnets } = CMCCanister.create({
		agent,
		canisterId: CMC_ID
	});

	return await getSubnetTypesToSubnets({ certified: true });
};

/**
 * The Dashboard API provides some information about the subnets, like their type and also statistics.
 * @returns {Promise<any>}
 */
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

// CMC.get_default_subnets
const subnetIds = await listSubnetIds();

// CMC.get_subnet_types_to_subnets
const { data: specifiedSubnetIds } = await listSpecifiedSubnetIds();

// Metadata from the dashboard API
const { subnets: subnetsMetadata } = await listSubnets();

const subnets = [
	...subnetIds.map((subnetId) => ({ subnetId })),
	...specifiedSubnetIds.flatMap(([specialization, subnetIds]) =>
		subnetIds.map((subnetId) => ({ subnetId, specialization }))
	)
].map(({ subnetId: sId, specialization }) => {
	const subnetId = sId.toText();
	const metadata = subnetsMetadata.find(({ subnet_id }) => subnet_id === subnetId);

	return {
		subnetId,
		...(nonNullish(specialization) && { specialization }),
		...(nonNullish(metadata) && {
			// The dashboard was instructed long ago to display verified_application as application
			type: metadata.subnet_type === 'verified_application' ? 'application' : metadata.subnet_type,
			canisters: {
				stopped: metadata.stopped_canisters,
				running: metadata.running_canisters
			},
			nodes: {
				up: metadata.up_nodes,
				total: metadata.total_nodes
			}
		})
	};
});

writeSubnets(subnets);
