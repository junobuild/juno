import { Ed25519KeyIdentity } from '@dfinity/identity';
import { nonNullish } from '@dfinity/utils';
import Conf from 'conf';
import prompts from 'prompts';

const askForPassword = async () => {
	const { encryptionKey } = await prompts([
		{
			type: 'password',
			name: 'encryptionKey',
			message: `What's your config password?`
		}
	]);

	// TODO: cli-tools
	// assertAnswerCtrlC(satellite, 'The satellite ID is mandatory');

	return encryptionKey;
};

let config;

const initConfig = async () => {
	if (nonNullish(config)) {
		return;
	}

	const encryptionKey = await askForPassword();

	config = new Conf({ projectName: 'juno-dev-console', encryptionKey });
};

export const saveToken = async (token) => {
	await initConfig();

	config.set('token', token);
};

export const getToken = async () => {
	await initConfig();

	return config.get('token');
};

export const getIdentity = async () => {
	const token = await getToken();
	return Ed25519KeyIdentity.fromParsedJson(token);
};
