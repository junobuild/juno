import type { _SERVICE as ICActor } from '$declarations/ic/ic.did';
import { idlFactory as idlFactorIC } from '$declarations/ic/ic.factory.did';
import { createActor } from '$lib/utils/actor.utils';
import { type GetAgentParams } from '$lib/utils/agent.utils';
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
