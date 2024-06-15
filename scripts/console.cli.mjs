#!/usr/bin/env node

import {
	nextArg,
	prepareDeploy,
	readJunoConfig as readJunoConfigTools
} from '@junobuild/cli-tools';

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

const deploy = async () => {
	const config = await readJunoConfig(env);

	// TODO: listAssets in console
	const listExistingAssets = async () => [];

	const { files: sourceFiles, sourceAbsolutePath } = await prepareDeploy({
		config,
		listAssets: listExistingAssets
	});

	console.log(sourceFiles, sourceAbsolutePath);
};

await deploy();
