import { getAnalyticsPageViews } from '$lib/services/orbiter/_orbiter.services';
import type { OrbiterDid } from '$lib/types/declarations';
import type {
	AnalyticsMetrics,
	AnalyticsPageViews,
	PageViewsParams,
	PageViewsPeriod,
	PageViewsPeriods
} from '$lib/types/orbiter';
import { batchAnalyticsRequests } from '$lib/utils/orbiter.paginated.utils';
import { buildAnalyticsPeriods } from '$lib/utils/orbiter.utils';
import { fromNullable, toNullable } from '@dfinity/utils';

export const getAnalyticsPageViewsForPeriods = async ({
	orbiterVersion,
	params
}: {
	params: PageViewsParams;
	orbiterVersion: string;
}): Promise<AnalyticsPageViews> => {
	const periods = buildAnalyticsPeriods({ params });

	const periodsMetrics = await getPageViews({
		orbiterVersion,
		params,
		periods
	});

	return {
		...aggregateMetrics({ periodsMetrics }),
		...aggregateTop10({ periodsMetrics }),
		...aggregateClients({ periodsMetrics })
	};
};

const aggregateTop10 = ({
	periodsMetrics
}: {
	periodsMetrics: AnalyticsPageViews[];
}): Pick<AnalyticsPageViews, 'top10'> => {
	const { referrers, pages, timeZones, utmCampaigns, utmSources } = periodsMetrics
		.map(({ top10 }) => top10)
		.reduce<{
			referrers: Record<string, number>;
			pages: Record<string, number>;
			timeZones: Record<string, number>;
			utmSources: Record<string, number>;
			utmCampaigns: Record<string, number>;
		}>(
			(acc, { referrers, pages, time_zones, utm_sources, utm_campaigns }) => {
				const cumulatedReferrers = referrers.map(([referrer, count]) => [
					referrer,
					count + (acc.referrers[referrer] ?? 0)
				]);

				const cumulatedPages = pages.map(([page, count]) => [page, count + (acc.pages[page] ?? 0)]);

				const cumulatedTimeZones = (fromNullable(time_zones) ?? []).map(([timeZone, count]) => [
					timeZone,
					count + (acc.pages[timeZone] ?? 0)
				]);

				const cumulatedUtmSources = (fromNullable(utm_sources) ?? []).map(([utmSource, count]) => [
					utmSource,
					count + (acc.pages[utmSource] ?? 0)
				]);

				const cumulatedUtmCampaigns = (fromNullable(utm_campaigns) ?? []).map(
					([utmCampaign, count]) => [utmCampaign, count + (acc.pages[utmCampaign] ?? 0)]
				);

				return {
					pages: {
						...acc.pages,
						...Object.fromEntries(cumulatedPages)
					},
					referrers: {
						...acc.referrers,
						...Object.fromEntries(cumulatedReferrers)
					},
					timeZones: {
						...acc.timeZones,
						...Object.fromEntries(cumulatedTimeZones)
					},
					utmSources: {
						...acc.utmSources,
						...Object.fromEntries(cumulatedUtmSources)
					},
					utmCampaigns: {
						...acc.utmCampaigns,
						...Object.fromEntries(cumulatedUtmCampaigns)
					}
				};
			},
			{ referrers: {}, pages: {}, timeZones: {}, utmSources: {}, utmCampaigns: {} }
		);

	const mapTop10 = (records: Record<string, number>): [string, number][] =>
		Object.entries(records)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10);

	const mapOptionalTop10 = (records: Record<string, number>): [] | [[string, number][]] => {
		const top10 = mapTop10(records);
		return toNullable(top10.length === 0 ? undefined : top10);
	};

	return {
		top10: {
			referrers: mapTop10(referrers),
			pages: mapTop10(pages),
			time_zones: toNullable(mapTop10(timeZones)),
			utm_sources: mapOptionalTop10(utmSources),
			utm_campaigns: mapOptionalTop10(utmCampaigns)
		}
	};
};

const aggregateClients = ({
	periodsMetrics
}: {
	periodsMetrics: AnalyticsPageViews[];
}): Pick<AnalyticsPageViews, 'clients'> => {
	let totalPageViews = 0;

	const browsersSum: Record<string, number> = {
		chrome: 0,
		firefox: 0,
		opera: 0,
		safari: 0,
		others: 0
	};

	const devicesSum: Record<string, number> = {
		mobile: 0,
		tablet: 0,
		laptop: 0,
		desktop: 0,
		others: 0
	};

	const osSum: Record<string, number> = {
		ios: 0,
		macos: 0,
		others: 0,
		linux: 0,
		android: 0,
		windows: 0
	};

	for (const { clients, metrics } of periodsMetrics) {
		const periodTotalPageViews = metrics.total_page_views;
		totalPageViews += periodTotalPageViews;

		for (const browser in clients.browsers ?? {}) {
			browsersSum[browser] +=
				((clients.browsers as Record<string, number> | undefined)?.[browser] ?? 0) *
				periodTotalPageViews;
		}

		for (const os in clients.operating_systems ?? {}) {
			osSum[os] +=
				((clients.operating_systems as Record<string, number> | undefined)?.[os] ?? 0) *
				periodTotalPageViews;
		}

		for (const device in clients.devices ?? {}) {
			switch (device) {
				case 'mobile':
					devicesSum.mobile += (clients.devices.mobile ?? 0) * periodTotalPageViews;
					break;
				case 'desktop':
					devicesSum.desktop += (clients.devices.desktop ?? 0) * periodTotalPageViews;
					break;
				case 'others':
					devicesSum.others += (clients.devices.others ?? 0) * periodTotalPageViews;
					break;
				case 'laptop':
					devicesSum.laptop += (fromNullable(clients.devices.laptop) ?? 0) * periodTotalPageViews;
					break;
				case 'tablet':
					devicesSum.tablet += (fromNullable(clients.devices.tablet) ?? 0) * periodTotalPageViews;
					break;
			}
		}
	}

	const mapClientsMetrics = (records: Record<string, number>): Record<string, number> =>
		Object.entries(records).reduce<Record<string, number>>(
			(acc, [key, count]) => ({
				...acc,
				[key]: totalPageViews > 0 ? count / totalPageViews : 0
			}),
			{}
		);

	const operating_systems = mapClientsMetrics(osSum);
	const browsers = mapClientsMetrics(browsersSum);
	const devices = mapClientsMetrics(devicesSum);

	const withOperatingSystems =
		operating_systems.android > 0 ||
		operating_systems.ios > 0 ||
		operating_systems.linux > 0 ||
		operating_systems.macos > 0 ||
		operating_systems.others > 0 ||
		operating_systems.windows > 0;

	const { mobile, tablet, laptop, desktop, others } = devices;

	const resultDevices: OrbiterDid.AnalyticsDevicesPageViews = {
		mobile,
		tablet: toNullable(tablet > 0 ? tablet : undefined),
		laptop: toNullable(laptop > 0 ? laptop : undefined),
		desktop,
		others
	};

	return {
		clients: {
			operating_systems: withOperatingSystems
				? (operating_systems as unknown as OrbiterDid.AnalyticsOperatingSystemsPageViews)
				: undefined,
			browsers: browsers as unknown as OrbiterDid.AnalyticsBrowsersPageViews,
			devices: resultDevices
		}
	};
};

const aggregateMetrics = ({
	periodsMetrics
}: {
	periodsMetrics: AnalyticsPageViews[];
}): Pick<AnalyticsPageViews, 'metrics'> => {
	const metrics = periodsMetrics
		.map(({ metrics }) => metrics)
		.reduce<AnalyticsMetrics>(
			(acc, metrics) => {
				const {
					total_page_views: totalPageViews,
					unique_page_views: uniquePageViews,
					unique_sessions: uniqueSessions,
					bounce_rate: bounceRate,
					average_page_views_per_session: averagePageViewsPerSessions
				} = metrics;

				const {
					total_page_views: accTotalPageViews,
					unique_page_views: accUniquePageViews,
					unique_sessions: accUniqueSessions,
					bounce_rate: accBounceRate,
					average_page_views_per_session: accAveragePageViewsPerSessions
				} = acc;

				const average = ({
					averageRate,
					ratePeriod,
					totalSessions,
					sessionsPeriod
				}: {
					averageRate: number;
					ratePeriod: number;
					totalSessions: number;
					sessionsPeriod: number;
				}): number => {
					const total = totalSessions + sessionsPeriod;

					if (total === 0) {
						return 0;
					}

					return (ratePeriod * sessionsPeriod + averageRate * totalSessions) / total;
				};

				return {
					...metrics,
					bounce_rate: average({
						totalSessions: Number(accUniqueSessions),
						averageRate: accBounceRate,
						ratePeriod: bounceRate,
						sessionsPeriod: Number(uniqueSessions)
					}),
					average_page_views_per_session: average({
						totalSessions: Number(accUniqueSessions),
						averageRate: accAveragePageViewsPerSessions,
						ratePeriod: averagePageViewsPerSessions,
						sessionsPeriod: Number(uniqueSessions)
					}),
					total_page_views: accTotalPageViews + totalPageViews,
					unique_page_views: accUniquePageViews + uniquePageViews,
					unique_sessions: accUniqueSessions + uniqueSessions,
					daily_total_page_views: {
						...acc.daily_total_page_views,
						...metrics.daily_total_page_views
					}
				};
			},
			{
				bounce_rate: 0,
				average_page_views_per_session: 0,
				total_page_views: 0,
				unique_page_views: 0n,
				unique_sessions: 0n,
				daily_total_page_views: {}
			}
		);

	return { metrics };
};

const getPageViews = async ({
	orbiterVersion,
	params,
	periods
}: {
	params: PageViewsParams;
	orbiterVersion: string;
	periods: PageViewsPeriods;
}): Promise<AnalyticsPageViews[]> => {
	const fn = ({ period }: { period: Required<PageViewsPeriod> }): Promise<AnalyticsPageViews> =>
		getAnalyticsPageViews({
			orbiterVersion,
			params: {
				...params,
				...period
			}
		});

	return await batchAnalyticsRequests<AnalyticsPageViews>({
		periods,
		fn
	});
};
