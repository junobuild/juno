import type {
	AnalyticKey,
	Controller,
	PageView,
	OrbiterSatelliteConfig as SatelliteConfig,
	SetSatelliteConfig,
	TrackEvent
} from '$declarations/orbiter/orbiter.did';
import type { PageViewsPeriod } from '$lib/types/ortbiter';
import { getOrbiterActor } from '$lib/utils/actor.juno.utils';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { Principal } from '@dfinity/principal';
import { nonNullish, toNullable } from '@dfinity/utils';

export const getPageViews = async ({
	satelliteId,
	orbiterId,
	from,
	to
}: {
	satelliteId?: Principal;
	orbiterId: Principal;
} & PageViewsPeriod): Promise<[AnalyticKey, PageView][]> => {
	const actor = await getOrbiterActor({ orbiterId });
	return actor.get_page_views({
		satellite_id: toNullable(satelliteId),
		from: nonNullish(from) ? [toBigIntNanoSeconds(from)] : [],
		to: nonNullish(to) ? [toBigIntNanoSeconds(to)] : []
	});
};

export const getTrackEvents = async ({
	satelliteId,
	orbiterId,
	from,
	to
}: {
	satelliteId?: Principal;
	orbiterId: Principal;
} & PageViewsPeriod): Promise<[AnalyticKey, TrackEvent][]> => {
	const actor = await getOrbiterActor({ orbiterId });
	return actor.get_track_events({
		satellite_id: toNullable(satelliteId),
		from: nonNullish(from) ? [toBigIntNanoSeconds(from)] : [],
		to: nonNullish(to) ? [toBigIntNanoSeconds(to)] : []
	});
};

export const listOrbiterControllers = async ({
	orbiterId
}: {
	orbiterId: Principal;
}): Promise<[Principal, Controller][]> => {
	const actor = await getOrbiterActor({ orbiterId });
	return actor.list_controllers();
};

export const listOrbiterSatelliteConfigs = async ({
	orbiterId
}: {
	orbiterId: Principal;
}): Promise<[Principal, SatelliteConfig][]> => {
	const actor = await getOrbiterActor({ orbiterId });
	return actor.list_satellite_configs();
};

export const setOrbiterSatelliteConfigs = async ({
	orbiterId,
	config
}: {
	orbiterId: Principal;
	config: [Principal, SetSatelliteConfig][];
}): Promise<[Principal, SatelliteConfig][]> => {
	const actor = await getOrbiterActor({ orbiterId });
	return actor.set_satellite_configs(config);
};

export const orbiterVersion = async ({ orbiterId }: { orbiterId: Principal }): Promise<string> => {
	const actor = await getOrbiterActor({ orbiterId });
	return actor.version();
};

export const depositCycles = async ({
	orbiterId,
	cycles,
	destinationId: destination_id
}: {
	orbiterId: Principal;
	cycles: bigint;
	destinationId: Principal;
}) => {
	const { deposit_cycles } = await getOrbiterActor({ orbiterId });
	return deposit_cycles({
		cycles,
		destination_id
	});
};
