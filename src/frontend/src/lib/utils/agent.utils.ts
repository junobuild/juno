import { localIdentityCanisterId } from '$lib/constants/constants';
import { HttpAgent, type Identity } from '@dfinity/agent';
import type { HttpAgentOptions } from '@dfinity/agent/lib/esm/agent/http';
import { nonNullish } from '@dfinity/utils';

export type GetAgentParams = { identity: Identity } & Pick<
	HttpAgentOptions,
	'verifyQuerySignatures'
>;

export const getAgent = async (params: GetAgentParams): Promise<HttpAgent> => {
	const local = nonNullish(localIdentityCanisterId);

	if (local) {
		return getLocalAgent(params);
	}

	return getMainnetAgent(params);
};

const getMainnetAgent = async ({ identity, verifyQuerySignatures = true }: GetAgentParams) => {
	const host = 'https://icp0.io';
	return new HttpAgent({ identity, host, verifyQuerySignatures });
};

const getLocalAgent = async ({ identity, verifyQuerySignatures = true }: GetAgentParams) => {
	const host = 'http://localhost:8000/';

	const agent: HttpAgent = new HttpAgent({ identity, host, verifyQuerySignatures });

	// Fetch root key for certificate validation during development
	await agent.fetchRootKey();

	return agent;
};
