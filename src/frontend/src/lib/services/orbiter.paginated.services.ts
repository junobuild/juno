import type {
	AnalyticsBrowsersPageViews,
	AnalyticsOperatingSystemsPageViews, AnalyticsSizesPageViews
} from '$declarations/orbiter/orbiter.did';
import { getAnalyticsPageViews } from '$lib/services/orbiters.services';
import type { AnalyticsPageViews, PageViewsParams } from '$lib/types/orbiter';
import { isNullish } from '@dfinity/utils';
import { eachHourOfInterval } from 'date-fns';

export const getAnalyticsPageViewsPerDay = async ({
	orbiterVersion,
	params
}: {
	params: PageViewsParams;
	orbiterVersion: string;
}): Promise<AnalyticsPageViews> => {
	const periods = buildPeriods({ params });

	const dailyMetrics = await getAnalyticsPageViewsForPeriods({
		orbiterVersion,
		params,
		periods
	});

	return {
		...aggregateMetrics({ dailyMetrics }),
		...aggregateTop10({ dailyMetrics }),
		...aggregateClients({ dailyMetrics })
	};
};

const aggregateTop10 = ({
	dailyMetrics
}: {
	dailyMetrics: AnalyticsPageViews[];
}): Pick<AnalyticsPageViews, 'top10'> => {
	const { referrers, pages } = dailyMetrics
		.map(({ top10 }) => top10)
		.reduce<{ referrers: Record<string, number>; pages: Record<string, number> }>(
			(acc, { referrers, pages }) => {
				const cumulatedReferrers = referrers.map(([referrer, count]) => [
					referrer,
					count + (acc.referrers[referrer] ?? 0)
				]);

				const cumulatedPages = pages.map(([page, count]) => [page, count + (acc.pages[page] ?? 0)]);

				return {
					pages: {
						...acc.pages,
						...Object.fromEntries(cumulatedPages)
					},
					referrers: {
						...acc.referrers,
						...Object.fromEntries(cumulatedReferrers)
					}
				};
			},
			{ referrers: {}, pages: {} }
		);

	const mapTop10 = (records: Record<string, number>): [string, number][] =>
		Object.entries(records)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10);

	return {
		top10: {
			referrers: mapTop10(referrers),
			pages: mapTop10(pages)
		}
	};
};

const aggregateClients = ({
	dailyMetrics
}: {
	dailyMetrics: AnalyticsPageViews[];
}): Pick<AnalyticsPageViews, 'clients'> => {
	let totalPageViews = 0;

	const browsersSum: Record<string, number> = {
		chrome: 0,
		firefox: 0,
		opera: 0,
		safari: 0,
		others: 0
	};

	const sizesSum: Record<string, number> = {
		mobile: 0,
		tablet: 0,
		laptop: 0,
		desktop: 0
	};

	const osSum: Record<string, number> = {
		ios: 0,
		macos: 0,
		others: 0,
		linux: 0,
		android: 0,
		windows: 0,
	};

	for (const { clients, metrics } of dailyMetrics) {
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

		for (const size in clients.sizes ?? {}) {
			sizesSum[size] +=
				(clients.sizes[size as keyof AnalyticsSizesPageViews] ?? 0) * periodTotalPageViews;
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
	const sizes = mapClientsMetrics(sizesSum);

	return {
		clients: {
			operating_systems: operating_systems as unknown as AnalyticsOperatingSystemsPageViews,
			browsers: browsers as unknown as AnalyticsBrowsersPageViews,
			sizes: sizes as unknown as AnalyticsSizesPageViews
		}
	};
};

const aggregateMetrics = ({
	dailyMetrics
}: {
	dailyMetrics: AnalyticsPageViews[];
}): Pick<AnalyticsPageViews, 'metrics'> => {
	const metrics = dailyMetrics
		.map(({ metrics }) => metrics)
		.reduce((acc, metrics) => {
			if (isNullish(acc)) {
				return metrics;
			}

			const {
				total_page_views: totalPageViews,
				unique_page_views: uniquePageViews,
				unique_sessions: uniqueSessions,
				total_sessions: totalSessions,
				bounce_rate: bounceRate,
				average_page_views_per_session: averagePageViewsPerSessions
			} = metrics;

			const {
				total_page_views: accTotalPageViews,
				unique_page_views: accUniquePageViews,
				unique_sessions: accUniqueSessions,
				total_sessions: accTotalSessions,
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
					totalSessions: Number(accTotalSessions ?? accUniqueSessions),
					averageRate: accBounceRate,
					ratePeriod: bounceRate,
					sessionsPeriod: Number(totalSessions ?? uniqueSessions)
				}),
				average_page_views_per_session: average({
					totalSessions: Number(accTotalSessions ?? accUniqueSessions),
					averageRate: accAveragePageViewsPerSessions,
					ratePeriod: averagePageViewsPerSessions,
					sessionsPeriod: Number(totalSessions ?? uniqueSessions)
				}),
				total_page_views: accTotalPageViews + totalPageViews,
				unique_page_views: accUniquePageViews + uniquePageViews,
				unique_sessions: accUniqueSessions + uniqueSessions,
				total_sessions: (accTotalSessions ?? 0n) + (totalSessions ?? 0n),
				daily_total_page_views: {
					...acc.daily_total_page_views,
					...metrics.daily_total_page_views
				}
			};
		});

	return { metrics };
};

const getAnalyticsPageViewsForPeriods = async ({
	orbiterVersion,
	params,
	periods
}: {
	params: PageViewsParams;
	orbiterVersion: string;
	periods: Periods;
}): Promise<AnalyticsPageViews[]> =>
	await Promise.all(
		periods.map(({ from, to }) =>
			getAnalyticsPageViews({
				orbiterVersion,
				params: {
					...params,
					from,
					to
				}
			})
		)
	);

type Periods = Required<Pick<PageViewsParams, 'from' | 'to'>>[];

const buildPeriods = ({
	params
}: {
	params: Pick<PageViewsParams, 'from' | 'to' | 'periodicity'>;
}): Periods => {
	const { from, to, periodicity } = params;

	const days = eachHourOfInterval(
		{
			start: from,
			end: to ?? new Date()
		},
		{ step: periodicity }
	);

	const periods = [];
	for (let i = 0; i <= days.length - 2; i++) {
		periods.push({
			from: days[i],
			to: days[i + 1]
		});
	}

	return periods;
};
