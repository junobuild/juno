import { toNullable } from '@dfinity/utils';
import { fileExists } from '@junobuild/cli-tools';
import { uploadAsset } from '@junobuild/console';
import { assertNonNullish } from '@junobuild/utils';
import { parse } from '@ltd/j-toml';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deployWithProposal } from './console.deploy.services.mjs';
import { localConsole, readJunoConfig } from './console.deploy.utils.mjs';

const readVersion = (segment) => {
	const tomlFile = readFileSync(join(process.cwd(), 'src', segment, 'Cargo.toml'));
	const result = parse(tomlFile.toString());

	const version = result?.package?.version;

	assertNonNullish(version);

	return version;
};

const segments = {
	orbiter: readVersion('orbiter'),
	satellite: readVersion('satellite'),
	mission_control: readVersion('mission_control')
};

const proposal_type = {
	SegmentsDeployment: {
		orbiter: toNullable(segments.orbiter),
		mission_control_version: toNullable(segments.mission_control),
		satellite_version: toNullable(segments.satellite)
	}
};

const target = join(process.cwd(), 'target', 'deploy');

const deploy = async (proposalId) => {
	const upload = async ([sourceFile, version]) => {
		const sourceFilename = `${sourceFile}.wasm.gz`;
		const source = join(target, sourceFilename);

		if (!(await fileExists(source))) {
			return { sourceFile, uploaded: false };
		}

		const destinationFilename = `${sourceFile}-v${version}.wasm.gz`;
		const fullPath = `/releases/${destinationFilename}`;

		console.log(`↗️  Uploading ${source} to ${fullPath}`);

		const asset = {
			collection: '#releases',
			encoding: 'identity',
			filename: destinationFilename,
			fullPath,
			headers: [],
			data: new Blob([await readFile(source)])
		};

		await uploadAsset({
			asset,
			proposalId,
			console: await localConsole()
		});

		console.log(`✅  ${source} uploaded to ${fullPath}`);

		return { sourceFile, uploaded: true };
	};

	const results = await Promise.all(Object.entries(segments).map(upload));

	return {
		sourceFiles: results.filter(({ uploaded }) => uploaded).map(({ sourceFile }) => sourceFile)
	};
};

await deployWithProposal({
	proposal_type,
	deploy
});

const config = await readJunoConfig();

console.log(
	`\n✅ Segments uploaded. Metadata: http://${config.id}.localhost:5987/releases/metadata.json`
);
