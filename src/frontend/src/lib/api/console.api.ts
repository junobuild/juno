import type { ConsoleDid } from '$declarations';
import type { GetActorParams } from '$lib/api/actors/actor.api';
import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import type {
	CreateSatelliteConfig,
	CreateWithConfig,
	CreateWithConfigAndName
} from '$lib/types/factory';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Metadata } from '$lib/types/metadata';
import type { OrbiterId } from '$lib/types/orbiter';
import type { SatelliteId } from '$lib/types/satellite';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
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
	segmentKind: ConsoleDid.SegmentKind;
}): Promise<ConsoleDid.FactoryFee> => {
	const { get_fee } = await getConsoleActor({ identity });
	return await get_fee(segmentKind);
};

export const setSegmentMetadata = async ({
	segmentId,
	segmentKind,
	metadata,
	identity
}: {
	segmentId: Principal;
	segmentKind: ConsoleDid.StorableSegmentKind;
	metadata: Metadata;
	identity: OptionIdentity;
}): Promise<ConsoleDid.Segment> => {
	const { set_segment_metadata } = await getConsoleActor({ identity });
	return set_segment_metadata({
		segment_id: segmentId,
		segment_kind: segmentKind,
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

export const setSegment = async ({
	args,
	identity
}: {
	args: ConsoleDid.SetSegmentsArgs;
	identity: OptionIdentity;
}): Promise<ConsoleDid.Segment> => {
	const { set_segment } = await getConsoleActor({ identity });
	return set_segment(args);
};

export const createMissionControlWithConfig = async ({
	identity,
	config: { subnetId }
}: {
	identity: OptionIdentity;
	config: CreateWithConfig;
}): Promise<SatelliteId> => {
	assertNonNullish(identity);

	const { create_mission_control } = await getConsoleActor({
		identity
	});

	return create_mission_control({
		subnet_id: toNullable(subnetId)
	});
};

export const createSatelliteWithConfig = async ({
	identity,
	config: { name, subnetId, kind }
}: {
	identity: OptionIdentity;
	config: CreateSatelliteConfig;
}): Promise<SatelliteId> => {
	assertNonNullish(identity);

	const { create_satellite } = await getConsoleActor({
		identity
	});

	return create_satellite({
		// Unused
		block_index: toNullable(),
		// We use the same API as the one use by the Mission Control.
		// The backend fetches the account for that user and then assert its owner is equals to the caller.
		user: identity.getPrincipal(),
		name: toNullable(name),
		subnet_id: toNullable(subnetId),
		storage: toNullable(
			kind === 'application'
				? {
						system_memory: toNullable({
							Stable: null
						})
					}
				: undefined
		)
	});
};

export const createOrbiterWithConfig = async ({
	identity,
	config: { name, subnetId }
}: {
	identity: OptionIdentity;
	config: CreateWithConfigAndName;
}): Promise<OrbiterId> => {
	assertNonNullish(identity);

	const { create_orbiter } = await getConsoleActor({
		identity
	});

	return create_orbiter({
		// Unused
		block_index: toNullable(),
		// We use the same API as the one use by the Mission Control.
		// The backend fetches the account for that user and then assert its owner is equals to the caller.
		user: identity.getPrincipal(),
		name: toNullable(name),
		subnet_id: toNullable(subnetId)
	});
};
