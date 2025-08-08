import { Ed25519KeyIdentity } from '@dfinity/identity';
import { nonNullish } from '@dfinity/utils';
import { assertAnswerCtrlC } from '@junobuild/cli-tools';
import Conf from 'conf';
import prompts from 'prompts';
import { isHeadless } from './utils.mjs';

const askForPassword = async () => {
	const { encryptionKey } = await prompts([
		{
			type: 'password',
			name: 'encryptionKey',
			message: `What's your config password?`
		}
	]);

	assertAnswerCtrlC(encryptionKey);

	return encryptionKey;
};

let config;

const initConfig = async (mainnet) => {
	if (nonNullish(config)) {
		return;
	}

	const encryptionKey = isHeadless() ? false : await askForPassword();

	const projectName = `juno-${mainnet ? '' : 'dev-'}console`;

	config = new Conf({ projectName, encryptionKey });
};

export const saveToken = async ({ mainnet, token }) => {
	await initConfig(mainnet);

	config.set('token', token);
};

export const getToken = async (mainnet) => {
	await initConfig(mainnet);

	return config.get('token');
};

export const getIdentity = async (mainnet) => {
	const token = await getToken(mainnet);
	return Ed25519KeyIdentity.fromParsedJson(token);
};
