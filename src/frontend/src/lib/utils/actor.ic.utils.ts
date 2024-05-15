import type { _SERVICE as CMCActor } from '$declarations/cmc/cmc.did';
import { idlFactory as idlFactorCMC } from '$declarations/cmc/cmc.factory.did';
import type { _SERVICE as ICActor } from '$declarations/ic/ic.did';
import { idlFactory as idlFactorIC } from '$declarations/ic/ic.factory.did';
import { CMC_CANISTER_ID } from '$lib/constants/constants';
import { createActor } from '$lib/utils/actor.utils';
import { getAgent, type GetAgentParams } from '$lib/utils/agent.utils';
import type { CallConfig } from '@dfinity/agent';
import { Actor, AnonymousIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export const getCMCActor = async (): Promise<CMCActor> => {
	const agent = await getAgent({ identity: new AnonymousIdentity() });

	return Actor.createActor(idlFactorCMC, {
		agent,
		canisterId: CMC_CANISTER_ID
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

export const getICActor = (params: GetAgentParams): Promise<ICActor> =>
	createActor<ICActor>({
		canisterId: MANAGEMENT_CANISTER_ID,
		config: {
			callTransform: transform,
			queryTransform: transform
		},
		idlFactory: idlFactorIC,
		...params
	});
