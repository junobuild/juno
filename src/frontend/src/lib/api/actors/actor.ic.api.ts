import { type ICActor, idlFactoryCertifiedIC, idlFactoryIC } from '$declarations';
import type { GetAgentParams } from '$lib/api/_agent/_agent.api';
import { ActorApi, type GetActorParams } from '$lib/api/actors/actor.api';
import { nonNullish } from '@dfinity/utils';
import type { ActorConfig, CallConfig } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';

const MANAGEMENT_CANISTER_ID = Principal.fromText('aaaaa-aa');

type CallTransform = Required<ActorConfig>['callTransform'];

type QueryTransform = Required<ActorConfig>['queryTransform'];

// Source: `@icp-sdk/canisters/ic-management` function `transform`
// eslint-disable-next-line local-rules/prefer-object-params
const transform: CallTransform | QueryTransform = (
	methodName: string,
	args: (Record<string, unknown> & {
		canister_id?: unknown;
		target_canister?: unknown;
	})[],
	_callConfig: CallConfig
): { effectiveCanisterId: Principal } => {
	const [first] = args;

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

export const getICActor = async ({
	certified,
	...params
}: GetAgentParams & Pick<GetActorParams, 'certified'>): Promise<ICActor> =>
	await icActor.getActor({
		canisterId: MANAGEMENT_CANISTER_ID,
		config: {
			callTransform: transform,
			queryTransform: transform
		},
		idlFactory: certified === false ? idlFactoryIC : idlFactoryCertifiedIC,
		certified: certified ?? true,
		...params
	});
