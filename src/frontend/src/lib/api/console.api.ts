import type { MissionControl } from '$declarations/console/console.did';
import type { GetActorParams } from '$lib/api/actors/actor.api';
import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';
import { fromNullable, isNullish } from '@dfinity/utils';

export const initMissionControl = async (identity: OptionIdentity): Promise<MissionControl> => {
	const { init_user_mission_control_center } = await getConsoleActor({ identity });

	return await init_user_mission_control_center();
};

export const getMissionControl = async (
	actorParams: GetActorParams
): Promise<MissionControl | undefined> => {
	const { get_user_mission_control_center } = await getConsoleActor(actorParams);

	return fromNullable(await get_user_mission_control_center());
};

export const getCredits = async (identity: OptionIdentity): Promise<bigint> => {
	const { get_credits } = await getConsoleActor({ identity });
	const { e8s } = await get_credits();
	return e8s;
};

export const getSatelliteFee = async ({
	user,
	identity
}: {
	user: Principal;
	identity: OptionIdentity;
}): Promise<bigint> => {
	const actor = await getConsoleActor({ identity });
	const result = await actor.get_create_satellite_fee({ user });
	const fee = fromNullable(result);

	// If user has enough credits, it returns no fee
	return isNullish(fee) ? 0n : fee.e8s;
};

export const getOrbiterFee = async ({
	user,
	identity
}: {
	user: Principal;
	identity: OptionIdentity;
}): Promise<bigint> => {
	const actor = await getConsoleActor({ identity });
	const result = await actor.get_create_orbiter_fee({ user });
	const fee = fromNullable(result);

	// If user has enough credits, it returns no fee
	return isNullish(fee) ? 0n : fee.e8s;
};
