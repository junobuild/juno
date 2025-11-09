import { fromNullable, uint8ArrayToHexString } from '@dfinity/utils';
import { commitProposal, initProposal, submitProposal } from '@junobuild/cdn';
import { deployConsole } from './console.deploy.utils.mjs';

export const deployWithProposal = async ({ proposal_type, deploy }) => {
	const [proposalId, _] = await initProposal({
		proposalType: proposal_type,
		cdn: {
			console: await deployConsole()
		}
	});

	const result = await deploy(proposalId);

	if (result.result === 'skipped') {
		process.exit(0);
	}

	const { files } = result;

	if (files.length === 0) {
		process.exit(0);
	}

	const [__, { sha256, status }] = await submitProposal({
		proposalId,
		cdn: {
			console: await deployConsole()
		}
	});

	console.log('\nProposal submitted.\n');
	console.log('🆔 ', proposalId);
	console.log('🔒 ', uint8ArrayToHexString(fromNullable(sha256)));
	console.log('⏳ ', status);

	await commitProposal({
		proposal: {
			proposal_id: proposalId,
			sha256: fromNullable(sha256)
		},
		cdn: {
			console: await deployConsole()
		}
	});
};
