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

const initConfig = async (mainnet) => {
	if (nonNullish(config)) {
		return;
	}

	const encryptionKey = await askForPassword();

	const projectName = `juno-${mainnet ? "" : "dev-"}console`

	config = new Conf({ projectName, encryptionKey });
};

export const saveToken = async ({mainnet, token}) => {
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
