import type { _SERVICE as ICActor } from '$declarations/ic/ic.did';
import { idlFactory as idlFactoryIC } from '$declarations/ic/ic.factory.did';
import type { GetAgentParams } from '$lib/api/_agent/_agent.api';
import { ActorApi } from '$lib/api/actors/actor.api';
import type { ActorConfig, CallConfig } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';

const MANAGEMENT_CANISTER_ID = Principal.fromText('aaaaa-aa');

type CallTransform = Required<ActorConfig>['callTransform'];

type QueryTransform = Required<ActorConfig>['queryTransform'];

// Source: `@dfinity/ic-management` function `transform`
// eslint-disable-next-line local-rules/prefer-object-params
const transform: CallTransform | QueryTransform = (
	methodName: string,
	args: (Record<string, unknown> & {
		canister_id?: unknown;
		target_canister?: unknown;
	})[],
	_callConfig: CallConfig
): { effectiveCanisterId: Principal } => {
	const first = args[0];

	if (nonNullish(first) && typeof first === 'object') {
		if (methodName === 'install_chunked_code' && nonNullish(first.target_canister)) {
			return { effectiveCanisterId: Principal.from(first.target_canister) };
		}

		if (nonNullish(first.canister_id)) {
			return { effectiveCanisterId: Principal.from(first.canister_id) };
		}
	}

	return { effectiveCanisterId: MANAGEMENT_CANISTER_ID };
};

const icActor = new ActorApi<ICActor>();

export const getICActor = async (params: GetAgentParams): Promise<ICActor> =>
	await icActor.getActor({
		canisterId: MANAGEMENT_CANISTER_ID,
		config: {
			callTransform: transform,
			queryTransform: transform
		},
		idlFactory: idlFactoryIC,
		...params
	});
