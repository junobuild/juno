import type { ConsoleDid } from '$declarations';
import type { SegmentKind, SegmentType } from '$declarations/console/console.did';
import type { GetActorParams } from '$lib/api/actors/actor.api';
import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import type { OptionIdentity } from '$lib/types/itentity';
import { fromNullable, isNullish } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';

export const getOrInitAccount = async (
	actorParams: GetActorParams
): Promise<ConsoleDid.Account> => {
	const { get_or_init_account } = await getConsoleActor(actorParams);

	return await get_or_init_account();
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

export const getMissionControlFee = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<bigint> => await getFee({ identity, segmentKind: { MissionControl: null } });

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
