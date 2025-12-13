import type { ConsoleDid } from '$declarations';
import type { SegmentKind } from '$declarations/console/console.did';
import type { GetActorParams } from '$lib/api/actors/actor.api';
import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import type { OptionIdentity } from '$lib/types/itentity';
import { fromNullable, isNullish } from '@dfinity/utils';

export const initAccountAndMissionControl = async (
	identity: OptionIdentity
): Promise<ConsoleDid.Account> => {
	const { init_user_mission_control_center } = await getConsoleActor({ identity });

	return await init_user_mission_control_center();
};

export const getAccount = async (
	actorParams: GetActorParams
): Promise<ConsoleDid.Account | undefined> => {
	const { get_account } = await getConsoleActor(actorParams);

	return fromNullable(await get_account());
};

export const getCredits = async (identity: OptionIdentity): Promise<bigint> => {
	const { get_credits } = await getConsoleActor({ identity });
	const { e8s } = await get_credits();
	return e8s;
};

export const getSatelliteFee = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<bigint> => await getFee({ identity, segmentKind: { Satellite: null } });

export const getOrbiterFee = async ({ identity }: { identity: OptionIdentity }): Promise<bigint> =>
	await getFee({ identity, segmentKind: { Orbiter: null } });

const getFee = async ({
	identity,
	segmentKind
}: {
	identity: OptionIdentity;
	segmentKind: SegmentKind;
}): Promise<bigint> => {
	const { get_create_fee } = await getConsoleActor({ identity });

	const result = await get_create_fee(segmentKind);
	const fee = fromNullable(result);

	// If user has enough credits, it returns no fee
	return isNullish(fee) ? 0n : fee.e8s;
};
