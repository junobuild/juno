#!/usr/bin/env node

import { uint8ArrayToHexString } from '@dfinity/utils';
import {
	deploy as cliDeploy,
	nextArg,
	readJunoConfig as readJunoConfigTools
} from '@junobuild/cli-tools';
import { consoleActorLocal } from './actor.mjs';

export const JUNO_CONFIG_FILENAME = 'juno.config';
const JUNO_CONFIG_FILE = { filename: JUNO_CONFIG_FILENAME };

const configEnv = (args) => {
	const mode = nextArg({ args, option: '-m' }) ?? nextArg({ args, option: '--mode' });
	return {
		mode: mode ?? 'production'
	};
};

const [_cmd, ...args] = process.argv.slice(2);

const env = configEnv(args);

const readJunoConfig = async (env) => {
	const config = (userConfig) => (typeof userConfig === 'function' ? userConfig(env) : userConfig);

	return await readJunoConfigTools({
		...JUNO_CONFIG_FILE,
		config
	});
};

const { init_assets_upload_group, propose_assets_upload_group } = await consoleActorLocal();

const uploadFile = async (file) => {
	// TODO: upload
};

const deploy = async () => {
	const config = await readJunoConfig(env);

	// TODO: listAssets in console
	const listExistingAssets = async () => [];

	await cliDeploy({
		config,
		listAssets: listExistingAssets,
		uploadFile
	});
};

const batchGroupId = await init_assets_upload_group();

await deploy();

const { sha256, status } = await propose_assets_upload_group(batchGroupId);

console.log('\nAssets uploaded and proposed.\n');
console.log('🆔 ', batchGroupId);
console.log('🔒 ', uint8ArrayToHexString(sha256));
console.log('⏳ ', status);
