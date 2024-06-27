import { toNullable } from '@dfinity/utils';
import { deploy as cliDeploy, hasArgs } from '@junobuild/cli-tools';
import { uploadAsset } from '@junobuild/console';
import { consoleActorLocal } from './actor.mjs';
import { deployWithProposal } from './console.deploy.services.mjs';
import { localConsole, readJunoConfig } from './console.deploy.utils.mjs';

const args = process.argv.slice(2);

const clear = hasArgs({ args, options: ['--clear'] });

const proposal_type = {
	AssetsUpgrade: {
		clear_existing_assets: clear ? toNullable(true) : toNullable()
	}
};

const { list_assets } = await consoleActorLocal();

const listAssets = async ({ startAfter }) => {
	const { items, items_page, matches_pages } = await list_assets('#dapp', {
		order: [
			{
				desc: true,
				field: { Keys: null }
			}
		],
		owner: [],
		matcher: [],
		paginate: [
			{
				start_after: toNullable(startAfter),
				limit: [500n]
			}
		]
	});

	const sha256ToBase64String = (sha256) =>
		btoa([...sha256].map((c) => String.fromCharCode(c)).join(''));

	// For the deployment, we do not need the full Asset object but only fullPath and the sha256 encodings
	const assets = items.map(
		([
			_,
			{
				key: { full_path },
				encodings
			}
		]) => ({
			fullPath: full_path,
			encodings: encodings.reduce(
				(acc, [type, { modified, sha256, total_length }]) => ({
					...acc,
					[type]: {
						modified,
						sha256: sha256ToBase64String(sha256),
						total_length
					}
				}),
				{}
			)
		})
	);

	const last = (elements) => {
		const { length, [length - 1]: last } = elements;
		return last;
	};

	if ((items_page ?? 0n) < (matches_pages ?? 0n)) {
		const nextAssets = await listAssets({
			startAfter: last(assets)?.fullPath
		});
		return [...assets, ...nextAssets];
	}
	return assets;
};

const listExistingAssets = async ({ startAfter }) => {
	if (clear) {
		return [];
	}

	return await listAssets({ startAfter });
};

const config = await readJunoConfig();

const deployWithCli = async (proposalId) => {
	const upload = async (asset) => {
		await uploadAsset({
			asset,
			proposalId,
			console: await localConsole()
		});
	};

	return await cliDeploy({
		config,
		listAssets: listExistingAssets,
		uploadFile: upload
	});
};

await deployWithProposal({
	proposal_type,
	deploy: deployWithCli
});

console.log(`\n✅ Assets committed to http://${config.id}.localhost:5987/`);
