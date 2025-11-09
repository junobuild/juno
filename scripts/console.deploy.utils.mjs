import { nextArg } from '@junobuild/cli-tools';
import { readConsoleConfig as readConsoleConfigTools } from '@junobuild/config-loader';
import { getIdentity } from './console.config.utils.mjs';
import { CONSOLE_ID } from './constants.mjs';
import { targetMainnet } from './utils.mjs';

export const deployConsole = async () => {
	const mainnet = targetMainnet();

	return {
		identity: await getIdentity(mainnet),
		consoleId: CONSOLE_ID,
		...(!mainnet && { container: 'http://127.0.0.1:5987/' })
	};
};

export const JUNO_CONFIG_FILENAME = 'juno.config';
const JUNO_CONFIG_FILE = { filename: JUNO_CONFIG_FILENAME };

const configEnv = (args) => {
	const mode = nextArg({ args, option: '-m' }) ?? nextArg({ args, option: '--mode' });
	return {
		mode: mode ?? 'production'
	};
};

export const readJunoConfig = async () => {
	const args = process.argv.slice(2);

	const env = configEnv(args);

	const config = (userConfig) => (typeof userConfig === 'function' ? userConfig(env) : userConfig);

	return await readConsoleConfigTools({
		...JUNO_CONFIG_FILE,
		config
	});
};
