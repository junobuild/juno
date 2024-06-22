import { toNullable } from '@dfinity/utils';
import { fileExists } from '@junobuild/cli-tools';
import { assertNonNullish } from '@junobuild/utils';
import { parse } from '@ltd/j-toml';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deployWithProposal } from './console.deploy.services.mjs';
import {readJunoConfig, uploadFile} from './console.deploy.utils.mjs';

const readVersion = (segment) => {
	const tomlFile = readFileSync(join(process.cwd(), 'src', segment, 'Cargo.toml'));
	const result = parse(tomlFile.toString());

	const version = result?.package?.version;

	assertNonNullish(version);

	return version;
};

const proposal_type = {
	SegmentsDeployment: {
		orbiter: toNullable(readVersion('orbiter')),
		mission_control_version: toNullable(readVersion('mission_control')),
		satellite_version: toNullable(readVersion('satellite'))
	}
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

const config = await readJunoConfig();

console.log(`\n✅ Segments uploaded. Metadata: http://${config.id}.localhost:5987/releases/metadata.json`);