import { Ed25519KeyIdentity } from '@dfinity/identity';
import Conf from 'conf';

const config = new Conf({ projectName: 'juno-dev-console' });

export const saveToken = (token) => config.set('token', token);
export const getToken = () => config.get('token');

export const getIdentity = () => {
	const token = getToken();
	return Ed25519KeyIdentity.fromParsedJson(token);
};
