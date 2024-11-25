import type { _SERVICE as ICActor } from '$declarations/ic/ic.did';
import { idlFactory as idlFactorIC } from '$declarations/ic/ic.factory.did';
import { ActorApi } from '$lib/api/actors/actor.api';
import type { GetAgentParams } from '$lib/api/agent/agent.api';
import type { CallConfig } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

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

const icActor = new ActorApi<ICActor>();

export const getICActor = async (params: GetAgentParams): Promise<ICActor> =>
	await icActor.getActor({
		canisterId: MANAGEMENT_CANISTER_ID,
		config: {
			callTransform: transform,
			queryTransform: transform
		},
		idlFactory: idlFactorIC,
		...params
	});
