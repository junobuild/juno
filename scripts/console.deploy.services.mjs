#!/usr/bin/env node

import { fromNullable, uint8ArrayToHexString } from '@dfinity/utils';
import { consoleActorLocal } from './actor.mjs';

const { init_proposal, submit_proposal, commit_proposal } = await consoleActorLocal();

export const deployWithProposal = async ({ proposal_type, deploy }) => {
	const [proposalId, _] = await init_proposal(proposal_type);

	const { sourceFiles } = await deploy(proposalId);

	if (sourceFiles.length === 0) {
		process.exit(0);
	}

	const [__, { sha256, status }] = await submit_proposal(proposalId);

	console.log('\nProposal submitted.\n');
	console.log('🆔 ', proposalId);
	console.log('🔒 ', uint8ArrayToHexString(fromNullable(sha256)));
	console.log('⏳ ', status);

	await commit_proposal({
		proposal_id: proposalId,
		sha256: fromNullable(sha256)
	});
};
