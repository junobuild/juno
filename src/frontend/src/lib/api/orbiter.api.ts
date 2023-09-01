import type {
	AnalyticKey,
	Controller,
	DelOriginConfig,
	OriginConfig,
	PageView,
	SetOriginConfig,
	TrackEvent
} from '$declarations/orbiter/orbiter.did';
import type { PageViewsPeriod } from '$lib/types/ortbiter';
import { getOrbiterActor } from '$lib/utils/actor.utils';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { toNullable } from '$lib/utils/did.utils';
import { nonNullish } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';

export const getPageViews = async ({
	satelliteId,
	orbiterId,
	from,
	to
}: {
	satelliteId?: Principal;
	orbiterId: Principal;
} & PageViewsPeriod): Promise<[AnalyticKey, PageView][]> => {
	const actor = await getOrbiterActor(orbiterId);
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
	const actor = await getOrbiterActor(orbiterId);
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
	const actor = await getOrbiterActor(orbiterId);
	return actor.list_controllers();
};

export const listOriginConfigs = async ({
	orbiterId
}: {
	orbiterId: Principal;
}): Promise<[Principal, OriginConfig][]> => {
	const actor = await getOrbiterActor(orbiterId);
	return actor.list_origin_configs();
};

export const setOriginConfig = async ({
	satelliteId,
	orbiterId,
	config
}: {
	orbiterId: Principal;
	satelliteId: Principal;
	config: SetOriginConfig;
}): Promise<OriginConfig> => {
	const actor = await getOrbiterActor(orbiterId);
	return actor.set_origin_config(satelliteId, config);
};

export const deleteOriginConfig = async ({
	satelliteId,
	orbiterId,
	config
}: {
	orbiterId: Principal;
	satelliteId: Principal;
	config: DelOriginConfig;
}): Promise<void> => {
	const actor = await getOrbiterActor(orbiterId);
	return actor.del_origin_config(satelliteId, config);
};

export const orbiterVersion = async ({ orbiterId }: { orbiterId: Principal }): Promise<string> => {
	const actor = await getOrbiterActor(orbiterId);
	return actor.version();
};
