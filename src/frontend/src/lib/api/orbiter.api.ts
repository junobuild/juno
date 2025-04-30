import type {
	AnalyticKey,
	AnalyticsClientsPageViews,
	AnalyticsMetricsPageViews,
	AnalyticsTop10PageViews,
	AnalyticsTrackEvents,
	AnalyticsWebVitalsPerformanceMetrics,
	Controller,
	GetAnalytics,
	PageView,
	OrbiterSatelliteConfig as SatelliteConfig,
	SetSatelliteConfig,
	TrackEvent
} from '$declarations/orbiter/orbiter.did';
import { getOrbiterActor } from '$lib/api/actors/actor.juno.api';
import type { OptionIdentity } from '$lib/types/itentity';
import type { PageViewsParams, PageViewsPeriod } from '$lib/types/orbiter';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import type { Principal } from '@dfinity/principal';
import { nonNullish, toNullable } from '@dfinity/utils';

export const getPageViews = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<[AnalyticKey, PageView][]> => {
	const { get_page_views } = await getOrbiterActor({ orbiterId, identity });
	return getAnalytics({
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
	const { get_page_views_analytics_metrics } = await getOrbiterActor({ orbiterId, identity });
	return getAnalytics({
		satelliteId,
		from,
		to,
		fn: get_page_views_analytics_metrics
	});
};

export const getAnalyticsTop10PageViews = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<AnalyticsTop10PageViews> => {
	const { get_page_views_analytics_top_10 } = await getOrbiterActor({ orbiterId, identity });
	return getAnalytics({
		satelliteId,
		from,
		to,
		fn: get_page_views_analytics_top_10
	});
};

export const getAnalyticsClientsPageViews = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<AnalyticsClientsPageViews> => {
	const { get_page_views_analytics_clients } = await getOrbiterActor({ orbiterId, identity });
	return getAnalytics({
		satelliteId,
		from,
		to,
		fn: get_page_views_analytics_clients
	});
};

const getAnalytics = async <T>({
	satelliteId,
	from,
	to,
	fn
}: {
	satelliteId?: Principal;
	fn: (params: GetAnalytics) => Promise<T>;
} & PageViewsPeriod): Promise<T> =>
	await fn({
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
	const { get_track_events } = await getOrbiterActor({ orbiterId, identity });
	return getAnalytics({
		satelliteId,
		from,
		to,
		fn: get_track_events
	});
};

export const getTrackEventsAnalytics = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<AnalyticsTrackEvents> => {
	const { get_track_events_analytics } = await getOrbiterActor({ orbiterId, identity });
	return getAnalytics({
		satelliteId,
		from,
		to,
		fn: get_track_events_analytics
	});
};

export const getPerformanceMetricsAnalyticsWebVitals = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<AnalyticsWebVitalsPerformanceMetrics> => {
	const { get_performance_metrics_analytics_web_vitals } = await getOrbiterActor({
		orbiterId,
		identity
	});
	return getAnalytics({
		satelliteId,
		from,
		to,
		fn: get_performance_metrics_analytics_web_vitals
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
	const { list_satellite_configs } = await getOrbiterActor({ orbiterId, identity });
	return list_satellite_configs();
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
