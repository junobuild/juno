import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import type {
	AnalyticsTrackEvents,
	AnalyticsWebVitalsPerformanceMetrics,
	OrbiterSatelliteConfig,
	OrbiterSatelliteFeatures,
	OrbiterSatelliteConfig as SatelliteConfig
} from '$declarations/orbiter/orbiter.did';
import {
	getAnalyticsClientsPageViews,
	getAnalyticsMetricsPageViews,
	getAnalyticsTop10PageViews,
	getPerformanceMetricsAnalyticsWebVitals,
	getTrackEventsAnalytics,
	listOrbiterSatelliteConfigs as listOrbiterSatelliteConfigsApi,
	setOrbiterSatelliteConfigs as setOrbiterSatelliteConfigsApi
} from '$lib/api/orbiter.api';
import {
	listOrbiterSatelliteConfigs007,
	setOrbiterSatelliteConfigs007 as setOrbiterSatelliteConfigsDeprecatedApi
} from '$lib/api/orbiter.deprecated.api';
import { orbiterConfigs } from '$lib/derived/orbiter.derived';
import {
	getDeprecatedAnalyticsPageViews,
	getDeprecatedAnalyticsTrackEvents
} from '$lib/services/orbiters.deprecated.services';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { orbitersConfigsStore } from '$lib/stores/orbiter-configs.store';
import { orbitersStore } from '$lib/stores/orbiter.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type {
	AnalyticsPageViews,
	OrbiterSatelliteConfigEntry,
	PageViewsParams
} from '$lib/types/ortbiter';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { getMissionControlActor } from '$lib/utils/actor.juno.utils';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

interface CreateOrbiterConfig {
	name?: string;
	subnetId?: Principal;
}

export const createOrbiter = async ({
	missionControl,
	config: { name }
}: {
	missionControl: Option<Principal>;
	config: CreateOrbiterConfig;
}): Promise<Orbiter | undefined> => {
	assertNonNullish(missionControl);

	const identity = get(authStore).identity;

	const { create_orbiter } = await getMissionControlActor({
		missionControlId: missionControl,
		identity
	});
	return create_orbiter(toNullable(name));
};

export const createOrbiterWithConfig = async ({
	missionControl,
	config: { name, subnetId }
}: {
	missionControl: Option<Principal>;
	config: CreateOrbiterConfig;
}): Promise<Orbiter | undefined> => {
	assertNonNullish(missionControl);

	const identity = get(authStore).identity;

	const { create_orbiter_with_config } = await getMissionControlActor({
		missionControlId: missionControl,
		identity
	});
	return create_orbiter_with_config({
		name: toNullable(name),
		subnet_id: toNullable(subnetId)
	});
};

export const loadOrbiters = async ({
	missionControl,
	reload = false
}: {
	missionControl: Option<Principal>;
	reload?: boolean;
}) => {
	if (isNullish(missionControl)) {
		return;
	}

	// We load only once
	const orbiters = get(orbitersStore);
	if (nonNullish(orbiters) && !reload) {
		return;
	}

	try {
		const identity = get(authStore).identity;

		const actor = await getMissionControlActor({ missionControlId: missionControl, identity });
		const orbiters = await actor.list_orbiters();

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		orbitersStore.set(orbiters.map(([_, orbiter]) => orbiter));
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.orbiters_loading,
			detail: err
		});
	}
};

export const loadOrbiterConfigs = async ({
	orbiterId,
	orbiterVersion,
	reload = false
}: {
	orbiterId: Principal;
	orbiterVersion: string;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	// We load only once
	const existingConfigs = get(orbiterConfigs);
	if (nonNullish(existingConfigs) && !reload) {
		return { result: 'skip' };
	}

	try {
		const identity = get(authStore).identity;

		const configs = await listOrbiterSatelliteConfigs({
			identity,
			orbiterVersion,
			orbiterId
		});

		orbitersConfigsStore.setConfigs({
			configs,
			orbiterId: orbiterId.toText()
		});

		return { result: 'success' };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.orbiter_configuration_listing,
			detail: err
		});

		return { result: 'error' };
	}
};

export const getAnalyticsPageViews = async ({
	orbiterVersion,
	params
}: {
	params: PageViewsParams;
	orbiterVersion: string;
}): Promise<AnalyticsPageViews> => {
	if (compare(orbiterVersion, '0.0.4') >= 0) {
		const [metrics, top10, clients] = await Promise.all([
			getAnalyticsMetricsPageViews(params),
			getAnalyticsTop10PageViews(params),
			getAnalyticsClientsPageViews(params)
		]);

		const { daily_total_page_views, ...rest } = metrics;

		return {
			metrics: {
				...rest,
				daily_total_page_views: daily_total_page_views.reduce(
					(acc, [{ day, year, month }, value]) => {
						const date = new Date(year, month - 1, day);
						const key = date.getTime();

						return {
							...acc,
							[key]: value
						};
					},
					{}
				)
			},
			top10,
			clients
		};
	}

	// TODO: support for deprecated version of the Orbiter where the analytics are calculated in the frontend. To be removed.
	return getDeprecatedAnalyticsPageViews(params);
};

export const getAnalyticsTrackEvents = async ({
	orbiterVersion,
	params
}: {
	params: PageViewsParams;
	orbiterVersion: string;
}): Promise<AnalyticsTrackEvents> => {
	if (compare(orbiterVersion, '0.0.5') >= 0) {
		return await getTrackEventsAnalytics(params);
	}

	// TODO: support for deprecated version of the Orbiter where the analytics are calculated in the frontend. To be removed.
	return await getDeprecatedAnalyticsTrackEvents(params);
};

export const getAnalyticsPerformanceMetrics = async ({
	orbiterVersion,
	params
}: {
	params: PageViewsParams;
	orbiterVersion: string;
}): Promise<AnalyticsWebVitalsPerformanceMetrics | undefined> => {
	if (compare(orbiterVersion, '0.0.8') >= 0) {
		return await getPerformanceMetricsAnalyticsWebVitals(params);
	}

	return undefined;
};

const enabledFeatures = {
	performance_metrics: true,
	track_events: true,
	page_views: true
};

const listOrbiterSatelliteConfigs = async ({
	orbiterVersion,
	...rest
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
	orbiterVersion: string;
}): Promise<[Principal, SatelliteConfig][]> => {
	if (compare(orbiterVersion, '0.0.8') >= 0) {
		return await listOrbiterSatelliteConfigsApi(rest);
	}

	// Backwards compatibility
	const results = await listOrbiterSatelliteConfigs007(rest);

	return results.map(([satelliteId, { enabled, ...rest }]) => [
		satelliteId,
		{
			...rest,
			features: enabled ? [enabledFeatures] : []
		}
	]);
};

export const setOrbiterSatelliteConfigs = async ({
	orbiterId,
	config,
	identity,
	orbiterVersion,
	features
}: {
	orbiterId: Principal;
	config: Record<SatelliteIdText, OrbiterSatelliteConfigEntry>;
	identity: OptionIdentity;
	orbiterVersion: string;
	features: OrbiterSatelliteFeatures | undefined;
}): Promise<[Principal, OrbiterSatelliteConfig][]> => {
	if (compare(orbiterVersion, '0.0.8') >= 0) {
		return await setOrbiterSatelliteConfigsApi({
			orbiterId,
			config: Object.entries(config).map(([satelliteId, value]) => [
				Principal.fromText(satelliteId),
				{
					features: value.enabled ? [features ?? enabledFeatures] : [],
					version: nonNullish(value.config) ? value.config.version : []
				}
			]),
			identity
		});
	}

	// Backwards compatibility
	const results = await setOrbiterSatelliteConfigsDeprecatedApi({
		orbiterId,
		config: Object.entries(config).map(([satelliteId, value]) => [
			Principal.fromText(satelliteId),
			{
				enabled: value.enabled,
				version: nonNullish(value.config) ? value.config.version : []
			}
		]),
		identity
	});

	return results.map(([satelliteId, { enabled, ...rest }]) => [
		satelliteId,
		{
			...rest,
			features: enabled ? [enabledFeatures] : []
		}
	]);
};
