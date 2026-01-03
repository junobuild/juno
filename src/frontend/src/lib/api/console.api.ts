import type { ConsoleDid } from '$declarations';
import type { SegmentKind, SegmentType } from '$declarations/console/console.did';
import type { GetActorParams } from '$lib/api/actors/actor.api';
import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Metadata } from '$lib/types/metadata';
import { fromNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';

export const getOrInitAccount = async (
	actorParams: Omit<GetActorParams, 'certified'>
): Promise<ConsoleDid.Account> => {
	// update only endpoint
	const { get_or_init_account } = await getConsoleActor({ ...actorParams, certified: true });

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
}): Promise<ConsoleDid.FactoryFee> => await getFee({ identity, segmentKind: { Satellite: null } });

export const getOrbiterFee = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<ConsoleDid.FactoryFee> => await getFee({ identity, segmentKind: { Orbiter: null } });

export const getMissionControlFee = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<ConsoleDid.FactoryFee> =>
	await getFee({ identity, segmentKind: { MissionControl: null } });

const getFee = async ({
	identity,
	segmentKind
}: {
	identity: OptionIdentity;
	segmentKind: SegmentKind;
}): Promise<ConsoleDid.FactoryFee> => {
	const { get_fee } = await getConsoleActor({ identity });
	return await get_fee(segmentKind);
};

export const setSegmentMetadata = async ({
	segmentId,
	segmentType,
	metadata,
	identity
}: {
	segmentId: Principal;
	segmentType: SegmentType;
	metadata: Metadata;
	identity: OptionIdentity;
}): Promise<ConsoleDid.Segment> => {
	const { set_segment_metadata } = await getConsoleActor({ identity });
	return set_segment_metadata({
		segment_id: segmentId,
		segment_type: segmentType,
		metadata
	});
};

export const unsetSegment = async ({
	args,
	identity
}: {
	args: ConsoleDid.UnsetSegmentsArgs;
	identity: OptionIdentity;
}): Promise<void> => {
	const { unset_segment } = await getConsoleActor({ identity });
	await unset_segment(args);
};
