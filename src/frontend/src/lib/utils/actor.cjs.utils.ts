import type { _SERVICE as CMCActor } from '$declarations/cmc/cmc.did';
import { idlFactory as idlFactorCMC } from '$declarations/cmc/cmc.factory.did';
import type { _SERVICE as ICActor } from '$declarations/ic/ic.did';
import { idlFactory as idlFactorIC } from '$declarations/ic/ic.factory.did';
import { getAgent } from '$lib/utils/agent.cjs.utils';
import type { ActorConfig, ActorMethod, ActorSubclass, CallConfig } from '@dfinity/agent';
import { Actor, AnonymousIdentity, type Identity } from '@dfinity/agent/lib/cjs/index';
import type { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

export const getCMCActor = async (): Promise<CMCActor> => {
	// Canister IDs are automatically expanded to .env config - see vite.config.ts
	const canisterId = import.meta.env.VITE_IC_CMC_CANISTER_ID;

	const agent = await getAgent({ identity: new AnonymousIdentity() });

	return Actor.createActor(idlFactorCMC, {
		agent,
		canisterId
	});
};

const MANAGEMENT_CANISTER_ID = Principal.fromText('aaaaa-aa');

/* eslint-disable */

// Source nns-dapp - dart -> JS bridge
const transform = (
	_methodName: string,
	args: unknown[],
	_callConfig: CallConfig
): { effectiveCanisterId: Principal } => {
	const first = args[0] as any;
	let effectiveCanisterId = MANAGEMENT_CANISTER_ID;
	if (first && typeof first === 'object' && first.canister_id) {
		effectiveCanisterId = Principal.from(first.canister_id as unknown);
	}

	return { effectiveCanisterId };
};

/* eslint-enable */

export const getICActor = (identity: Identity): Promise<ICActor> =>
	createActor<ICActor>({
		canisterId: MANAGEMENT_CANISTER_ID,
		config: {
			callTransform: transform,
			queryTransform: transform
		},
		idlFactory: idlFactorIC,
		identity
	});

const createActor = async <T = Record<string, ActorMethod>>({
	canisterId,
	idlFactory,
	identity,
	config
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
		...(config && { config })
	});
};
