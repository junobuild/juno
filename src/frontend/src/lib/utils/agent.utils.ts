import { localIdentityCanisterId } from '$lib/constants/constants';
import { HttpAgent, type Identity } from '@dfinity/agent';

export const getAgent = async (params: { identity: Identity }): Promise<HttpAgent> => {
	const local = localIdentityCanisterId !== undefined && localIdentityCanisterId !== null;

	if (local) {
		return getLocalAgent(params);
	}

	return getMainnetAgent(params);
};

const getMainnetAgent = async ({ identity }: { identity: Identity }) => {
	const host = 'https://ic0.app';
	return new HttpAgent({ identity, ...(host && { host }) });
};

const getLocalAgent = async ({ identity }: { identity: Identity }) => {
	const host = 'http://localhost:8000/';

	const agent: HttpAgent = new HttpAgent({ identity, ...(host && { host }) });

	// Fetch root key for certificate validation during development
	await agent.fetchRootKey();

	return agent;
};
