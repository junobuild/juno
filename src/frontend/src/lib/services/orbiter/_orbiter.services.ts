import {
	getAnalyticsClientsPageViews,
	getAnalyticsMetricsPageViews,
	getAnalyticsTop10PageViews,
	getPerformanceMetricsAnalyticsWebVitals,
	getTrackEventsAnalytics
} from '$lib/api/orbiter.api';
import { ORBITER_v0_0_4, ORBITER_v0_0_5, ORBITER_v0_0_8 } from '$lib/constants/version.constants';
import {
	getDeprecatedAnalyticsClientsPageViews,
	getDeprecatedAnalyticsPageViews,
	getDeprecatedAnalyticsTrackEvents
} from '$lib/services/orbiter/orbiters.deprecated.services';
import type { OrbiterDid } from '$lib/types/declarations';
import type { AnalyticsPageViews, PageViewsParams } from '$lib/types/orbiter';
import { fromNullable } from '@dfinity/utils';
import { compare } from 'semver';

export const getAnalyticsPageViews = async ({
	orbiterVersion,
	params
}: {
	params: PageViewsParams;
	orbiterVersion: string;
}): Promise<AnalyticsPageViews> => {
	if (compare(orbiterVersion, ORBITER_v0_0_4) >= 0) {
		const getClients =
			compare(orbiterVersion, ORBITER_v0_0_8) > 0
				? getAnalyticsClientsPageViews
				: getDeprecatedAnalyticsClientsPageViews;

		const [metrics, top10, clients] = await Promise.all([
			getAnalyticsMetricsPageViews(params),
			getAnalyticsTop10PageViews(params),
			getClients(params)
		]);

		const { daily_total_page_views, ...rest } = metrics;

		const { operating_systems, ...restClients } = clients;

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
			clients: {
				...restClients,
				operating_systems: fromNullable(operating_systems)
			}
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
}): Promise<OrbiterDid.AnalyticsTrackEvents> => {
	if (compare(orbiterVersion, ORBITER_v0_0_5) >= 0) {
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
}): Promise<OrbiterDid.AnalyticsWebVitalsPerformanceMetrics | undefined> => {
	if (compare(orbiterVersion, ORBITER_v0_0_8) >= 0) {
		return await getPerformanceMetricsAnalyticsWebVitals(params);
	}

	return undefined;
};
