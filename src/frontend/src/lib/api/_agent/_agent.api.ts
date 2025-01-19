import { DEV } from '$lib/constants/app.constants';
import type { Option } from '$lib/types/utils';
import { HttpAgent, type Identity } from '@dfinity/agent';
import { isNullish } from '@dfinity/utils';

export interface GetAgentParams {
	identity: Identity;
}

let agents: Option<Record<string, HttpAgent>> = undefined;

export const getAgent = async ({ identity }: GetAgentParams): Promise<HttpAgent> => {
	const key = identity.getPrincipal().toText();

	if (isNullish(agents) || isNullish(agents[key])) {
		const agent = await createAgent({ identity });

		agents = {
			...(agents ?? {}),
			[key]: agent
		};

		return agent;
	}

	return agents[key];
};

const createAgent = async (params: GetAgentParams): Promise<HttpAgent> => {
	if (DEV) {
		return await getLocalAgent(params);
	}

	return await getMainnetAgent(params);
};

const getMainnetAgent = async (params: GetAgentParams) => {
	const host = 'https://icp-api.io';
	return await HttpAgent.create({ ...params, host });
};

const getLocalAgent = async (params: GetAgentParams) => {
	const host = 'http://localhost:5987/';

	const agent: HttpAgent = await HttpAgent.create({ ...params, host });

	// Fetch root key for certificate validation during development
	await agent.fetchRootKey();

	return agent;
};

// Unused because currently we do a window.location.reload after logout
export const clearAgents = () => (agents = null);
