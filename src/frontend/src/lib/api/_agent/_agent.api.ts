import { LOCAL_REPLICA_HOST } from '$lib/constants/app.constants';
import { isDev } from '$lib/env/app.env';
import type { Option } from '$lib/types/utils';
import { HttpAgent, type Identity } from '@dfinity/agent';
import { isNullish } from '@dfinity/utils';

export interface GetAgentParams {
	identity: Identity;
}

let agents: Option<Record<string, HttpAgent>> = undefined;

// Attempt to prevent the random IC issue triggered by agent-js at the end of the Satellite creation process in the UI.
// Note: The process of creation works as expected; the module is successfully created. It's really the calls from the UI that fails randomly, "fortunately".
// Server returned an error: Code: 400 () Body: Invalid signature: Invalid basic signature: EcdsaP256 signature could not be verified: public key 042..., signature f1a..., error: verification failed
const DEFAULT_RETRY_TIMES = 10;

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
	if (isDev()) {
		return await getLocalAgent(params);
	}

	return await getMainnetAgent(params);
};

const getMainnetAgent = async (params: GetAgentParams): Promise<HttpAgent> => {
	const host = 'https://icp-api.io';
	return await HttpAgent.create({ ...params, host, retryTimes: DEFAULT_RETRY_TIMES });
};

const getLocalAgent = async (params: GetAgentParams): Promise<HttpAgent> =>
	await HttpAgent.create({
		...params,
		host: LOCAL_REPLICA_HOST,
		shouldFetchRootKey: true,
		retryTimes: DEFAULT_RETRY_TIMES
	});

// Unused because currently we do a window.location.reload after logout
export const clearAgents = () => (agents = null);
