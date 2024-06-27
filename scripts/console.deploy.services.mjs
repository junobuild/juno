import { fromNullable, uint8ArrayToHexString } from '@dfinity/utils';
import { commitProposal, initProposal, submitProposal } from '@junobuild/console';
import { deployConsole } from './console.deploy.utils.mjs';

export const deployWithProposal = async ({ proposal_type, deploy }) => {
	const [proposalId, _] = await initProposal({
		proposalType: proposal_type,
		console: await deployConsole()
	});

	const { sourceFiles } = await deploy(proposalId);

	if (sourceFiles.length === 0) {
		process.exit(0);
	}

	const [__, { sha256, status }] = await submitProposal({
		proposalId,
		console: await deployConsole()
	});

	console.log('\nProposal submitted.\n');
	console.log('🆔 ', proposalId);
	console.log('🔒 ', uint8ArrayToHexString(fromNullable(sha256)));
	console.log('⏳ ', status);

	await commitProposal({
		commitProposal: {
			proposal_id: proposalId,
			sha256: fromNullable(sha256)
		},
		console: await deployConsole()
	});
};
