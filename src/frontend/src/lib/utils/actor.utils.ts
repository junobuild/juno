import { getAgent } from '$lib/utils/agent.utils';
import {
	Actor,
	type ActorConfig,
	type ActorMethod,
	type ActorSubclass,
	type Identity
} from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export const createActor = async <T = Record<string, ActorMethod>>({
	canisterId,
	idlFactory,
	identity,
	config = {}
}: {
	canisterId: string | Principal;
	idlFactory: IDL.InterfaceFactory;
	identity: Identity;
	config?: Pick<ActorConfig, 'callTransform' | 'queryTransform'>;
}): Promise<ActorSubclass<T>> => {
	const agent = await getAgent({ identity });

	// Creates an actor with using the candid interface and the HttpAgent
	return Actor.createActor(idlFactory, {
		agent,
		canisterId,
		...config
	});
};
