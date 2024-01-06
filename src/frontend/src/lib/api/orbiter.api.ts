import type {
	AnalyticKey,
	AnalyticsDevicesPageViews,
	AnalyticsMetricsPageViews,
	AnalyticsTop10PageViews,
	Controller,
	GetAnalytics,
	PageView,
	OrbiterSatelliteConfig as SatelliteConfig,
	SetSatelliteConfig,
	TrackEvent
} from '$declarations/orbiter/orbiter.did';
import type { OptionIdentity } from '$lib/types/itentity';
import type { PageViewsParams, PageViewsPeriod } from '$lib/types/ortbiter';
import { getOrbiterActor } from '$lib/utils/actor.juno.utils';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { Principal } from '@dfinity/principal';
import { nonNullish, toNullable } from '@dfinity/utils';

export const getPageViews = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<[AnalyticKey, PageView][]> => {
	const { get_page_views } = await getOrbiterActor({ orbiterId, identity });
	return getAnalyticsPageViews({
		satelliteId,
		from,
		to,
		fn: get_page_views
	});
};

export const getAnalyticsMetricsPageViews = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<AnalyticsMetricsPageViews> => {
	const { get_page_views_metrics } = await getOrbiterActor({ orbiterId, identity });
	return getAnalyticsPageViews({
		satelliteId,
		from,
		to,
		fn: get_page_views_metrics
	});
};

export const getAnalyticsTop10PageViews = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<AnalyticsTop10PageViews> => {
	const { get_page_views_top_10 } = await getOrbiterActor({ orbiterId, identity });
	return getAnalyticsPageViews({
		satelliteId,
		from,
		to,
		fn: get_page_views_top_10
	});
};

export const getAnalyticsDevicesPageViews = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<AnalyticsDevicesPageViews> => {
	const { get_page_views_devices } = await getOrbiterActor({ orbiterId, identity });
	return getAnalyticsPageViews({
		satelliteId,
		from,
		to,
		fn: get_page_views_devices
	});
};

const getAnalyticsPageViews = async <T>({
	satelliteId,
	from,
	to,
	fn
}: {
	satelliteId?: Principal;
	fn: (params: GetAnalytics) => Promise<T>;
} & PageViewsPeriod): Promise<T> =>
	fn({
		satellite_id: toNullable(satelliteId),
		from: nonNullish(from) ? [toBigIntNanoSeconds(from)] : [],
		to: nonNullish(to) ? [toBigIntNanoSeconds(to)] : []
	});

export const getTrackEvents = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<[AnalyticKey, TrackEvent][]> => {
	const actor = await getOrbiterActor({ orbiterId, identity });
	return actor.get_track_events({
		satellite_id: toNullable(satelliteId),
		from: nonNullish(from) ? [toBigIntNanoSeconds(from)] : [],
		to: nonNullish(to) ? [toBigIntNanoSeconds(to)] : []
	});
};

export const listOrbiterControllers = async ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<[Principal, Controller][]> => {
	const actor = await getOrbiterActor({ orbiterId, identity });
	return actor.list_controllers();
};

export const listOrbiterSatelliteConfigs = async ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<[Principal, SatelliteConfig][]> => {
	const actor = await getOrbiterActor({ orbiterId, identity });
	return actor.list_satellite_configs();
};

export const setOrbiterSatelliteConfigs = async ({
	orbiterId,
	config,
	identity
}: {
	orbiterId: Principal;
	config: [Principal, SetSatelliteConfig][];
	identity: OptionIdentity;
}): Promise<[Principal, SatelliteConfig][]> => {
	const actor = await getOrbiterActor({ orbiterId, identity });
	return actor.set_satellite_configs(config);
};

export const orbiterVersion = async ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<string> => {
	const actor = await getOrbiterActor({ orbiterId, identity });
	return actor.version();
};

export const depositCycles = async ({
	orbiterId,
	cycles,
	destinationId: destination_id,
	identity
}: {
	orbiterId: Principal;
	cycles: bigint;
	destinationId: Principal;
	identity: OptionIdentity;
}) => {
	const { deposit_cycles } = await getOrbiterActor({ orbiterId, identity });
	return deposit_cycles({
		cycles,
		destination_id
	});
};
