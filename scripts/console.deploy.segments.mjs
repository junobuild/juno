import { fileExists } from '@junobuild/cli-tools';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deployWithProposal } from './console.deploy.services.mjs';
import { uploadFile } from './console.deploy.utils.mjs';

const proposal_type = {
	SegmentsDeployment: null
};

const target = join(process.cwd(), 'target', 'deploy');

const deploy = async (proposalId) => {
	const segments = ['satellite', 'orbiter', 'mission_control'];

	const upload = async (sourceFile) => {
		const filename = `${sourceFile}.wasm.gz`;
		const source = join(target, filename);

		if (!(await fileExists(source))) {
			return { sourceFile, uploaded: false };
		}

		console.log(`↗️  Uploading ${source}`);

		const asset = {
			collection: '#releases',
			encoding: 'identity',
			filename,
			fullPath: `/releases/${filename}`,
			headers: [],
			data: new Blob([await readFile(source)])
		};

		await uploadFile({
			asset,
			proposalId
		});

		console.log(`✅  ${source} uploaded`);

		return { sourceFile, uploaded: true };
	};

	const results = await Promise.all(segments.map(upload));

	return {
		sourceFiles: results.filter(({ uploaded }) => uploaded).map(({ sourceFile }) => sourceFile)
	};
};

await deployWithProposal({
	proposal_type,
	deploy
});
