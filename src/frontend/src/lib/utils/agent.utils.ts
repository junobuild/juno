import { localIdentityCanisterId } from '$lib/constants/constants';
import { HttpAgent, type Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

export const getAgent = async (params: { identity: Identity }): Promise<HttpAgent> => {
	const local = localIdentityCanisterId !== undefined && localIdentityCanisterId !== null;

	if (local) {
		return getLocalAgent(params);
	}

	return getMainnetAgent(params);
};

const getMainnetAgent = async ({ identity }: { identity: Identity }) => {
	const host = 'https://icp0.io';
	return new HttpAgent({ identity, ...(host && { host }) });
};

const getLocalAgent = async ({ identity }: { identity: Identity }) => {
	const host = 'http://localhost:8000/';

	const agent: HttpAgent = new HttpAgent({ identity, ...(host && { host }) });

	// Fetch root key for certificate validation during development
	await agent.fetchRootKey();

	return agent;
};

export const loadIdentity = async (): Promise<Identity | undefined> => {
	const authClient = await AuthClient.create({
		idleOptions: {
			disableIdle: true,
			disableDefaultIdleCallback: true
		}
	});

	return authClient.getIdentity();
};
