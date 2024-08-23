import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import type {
	AnalyticsTrackEvents,
	AnalyticsWebVitalsPerformanceMetrics
} from '$declarations/orbiter/orbiter.did';
import {
	getAnalyticsClientsPageViews,
	getAnalyticsMetricsPageViews,
	getAnalyticsTop10PageViews,
	getPerformanceMetricsAnalyticsWebVitals,
	getTrackEventsAnalytics
} from '$lib/api/orbiter.api';
import {
	getDeprecatedAnalyticsPageViews,
	getDeprecatedAnalyticsTrackEvents
} from '$lib/services/orbiters.deprecated.services';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { orbitersStore } from '$lib/stores/orbiter.store';
import { toasts } from '$lib/stores/toasts.store';
import type { AnalyticsPageViews, PageViewsParams } from '$lib/types/ortbiter';
import { getMissionControlActor } from '$lib/utils/actor.juno.utils';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

export const createOrbiter = async ({
	missionControl,
	orbiterName
}: {
	missionControl: Principal | undefined | null;
	orbiterName?: string;
}): Promise<Orbiter | undefined> => {
	assertNonNullish(missionControl);

	const identity = get(authStore).identity;

	const actor = await getMissionControlActor({ missionControlId: missionControl, identity });
	return actor.create_orbiter(toNullable(orbiterName));
};

export const loadOrbiters = async ({
	missionControl,
	reload = false
}: {
	missionControl: Principal | undefined | null;
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
		return getTrackEventsAnalytics(params);
	}

	// TODO: support for deprecated version of the Orbiter where the analytics are calculated in the frontend. To be removed.
	return getDeprecatedAnalyticsTrackEvents(params);
};

export const getAnalyticsPerformanceMetrics = async ({
	orbiterVersion,
	params
}: {
	params: PageViewsParams;
	orbiterVersion: string;
}): Promise<AnalyticsWebVitalsPerformanceMetrics | undefined> => {
	if (compare(orbiterVersion, '0.0.8') >= 0) {
		return getPerformanceMetricsAnalyticsWebVitals(params);
	}

	return undefined;
};
