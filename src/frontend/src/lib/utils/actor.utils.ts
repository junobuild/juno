import { getAgent, type GetAgentParams } from '$lib/utils/agent.utils';
import { Actor, type ActorConfig, type ActorMethod, type ActorSubclass } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export const createActor = async <T = Record<string, ActorMethod>>({
	canisterId,
	idlFactory,
	config = {},
	...rest
}: {
	canisterId: string | Principal;
	idlFactory: IDL.InterfaceFactory;
	config?: Pick<ActorConfig, 'callTransform' | 'queryTransform'>;
} & GetAgentParams): Promise<ActorSubclass<T>> => {
	const agent = await getAgent(rest);

	// Creates an actor with using the candid interface and the HttpAgent
	return Actor.createActor(idlFactory, {
		agent,
		canisterId,
		...config
	});
};
