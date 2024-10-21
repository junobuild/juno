import type {
	AnalyticKey,
	AnalyticsDevicesPageViews,
	AnalyticsTop10PageViews,
	AnalyticsTrackEvents,
	PageView
} from '$declarations/orbiter/orbiter.did';
import { getPageViews, getTrackEvents } from '$lib/api/orbiter.api';
import type {
	AnalyticsMetrics,
	AnalyticsPageViews,
	DateStartOfTheDay,
	PageViewsParams
} from '$lib/types/ortbiter';
import { fromBigIntNanoSeconds } from '$lib/utils/date.utils';
import { isAndroid, isAndroidTablet, isIPhone } from '$lib/utils/device.utils';
import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
import { startOfDay } from 'date-fns';

export const getDeprecatedAnalyticsPageViews = async (
	params: PageViewsParams
): Promise<AnalyticsPageViews> => {
	// TODO: support for deprecated version of the Orbiter where the analytics are calculated in the frontend. To be removed.
	const pageViews = await getPageViews(params);

	return {
		metrics: getDeprecatedAnalyticsMetricsPageViews(pageViews),
		top10: getDeprecatedAnalyticsTop10PageViews(pageViews),
		clients: {
			devices: getDeprecatedAnalyticsDevicesPageViews(pageViews)
		}
	};
};

export const getDeprecatedAnalyticsTrackEvents = async (
	params: PageViewsParams
): Promise<AnalyticsTrackEvents> => {
	const trackEvents = await getTrackEvents(params);

	const trackEventsSum = trackEvents.reduce<Record<string, number>>(
		(acc, [_, { name }]) => ({
			...acc,
			[name]: (acc[name] ?? 0) + 1
		}),
		{}
	);

	return {
		total: Object.entries(trackEventsSum)
	};
};

const getDeprecatedAnalyticsMetricsPageViews = (
	pageViews: [AnalyticKey, PageView][]
): AnalyticsMetrics => {
	const totalPageViews = pageViews.reduce<Record<DateStartOfTheDay, number>>(
		(acc, [{ collected_at }, _]) => {
			const date = fromBigIntNanoSeconds(collected_at);

			const key = startOfDay(date).getTime();

			return {
				...acc,
				[key]: (acc[key] ?? 0) + 1
			};
		},
		{}
	);

	const uniqueSessions = [...new Set(pageViews.map(([_, { session_id }]) => session_id))].length;

	const sessionsViews = pageViews.reduce<Record<string, number>>(
		(acc, [_, { session_id }]) => ({
			...acc,
			[session_id]: (acc[session_id] ?? 0) + 1
		}),
		{}
	);

	const sessionsUniqueViews = pageViews.reduce<Record<string, Set<string>>>(
		(acc, [_, { href, session_id }]) => ({
			...acc,
			[session_id]: (acc[session_id] ?? new Set()).add(href)
		}),
		{}
	);

	const uniquePageViews = Object.entries(sessionsUniqueViews).reduce(
		(acc, value) => acc + value[1].size,
		0
	);

	const singlePageViewSessions = Object.entries(sessionsViews).filter(
		([_key, value]) => value === 1
	).length;

	const totalSessions = Object.entries(sessionsViews).length;

	const bounceRate = totalSessions > 0 ? singlePageViewSessions / totalSessions : 0;

	return {
		unique_sessions: BigInt(uniqueSessions),
		unique_page_views: BigInt(uniquePageViews),
		total_page_views: pageViews.length,
		daily_total_page_views: totalPageViews,
		average_page_views_per_session: uniqueSessions > 0 ? pageViews.length / uniqueSessions : 0,
		bounce_rate: bounceRate
	};
};

const getDeprecatedAnalyticsTop10PageViews = (
	pageViews: [AnalyticKey, PageView][]
): AnalyticsTop10PageViews => {
	const referrers = pageViews
		.filter(
			([_, { referrer }]) => nonNullish(fromNullable(referrer)) && fromNullable(referrer) !== ''
		)
		.reduce<Record<string, number>>((acc, [_, { referrer }]) => {
			const ref = fromNullable(referrer) as string;

			let host: string;
			try {
				const url = new URL(ref);
				host = url.host;
			} catch (err: unknown) {
				host = ref;
			}

			return {
				...acc,
				[host]: (acc[host] ?? 0) + 1
			};
		}, {});

	const pages = pageViews.reduce<Record<string, number>>((acc, [_, { href }]) => {
		let pages: string;
		try {
			const { pathname } = new URL(href);
			pages = pathname;
		} catch (err: unknown) {
			pages = href;
		}

		return {
			...acc,
			[pages]: (acc[pages] ?? 0) + 1
		};
	}, {});

	const referrersEntries = Object.entries(referrers)
		.slice(0, 10)
		.sort(([_a, countA], [_b, countB]) => countB - countA);

	const pagesEntries = Object.entries(pages)
		.slice(0, 10)
		.sort(([_a, countA], [_b, countB]) => countB - countA);

	return {
		referrers: referrersEntries,
		pages: pagesEntries
	};
};

const getDeprecatedAnalyticsDevicesPageViews = (
	pageViews: [AnalyticKey, PageView][]
): AnalyticsDevicesPageViews => {
	const total = pageViews.length;

	const { desktop, mobile, others } = pageViews.reduce(
		(acc, [_, { user_agent }]) => {
			const userAgent = fromNullable(user_agent);

			if (isNullish(userAgent)) {
				return {
					...acc,
					other: acc.others + 1
				};
			}

			const mobile = isIPhone(userAgent) || (isAndroid(userAgent) && !isAndroidTablet(userAgent));

			if (mobile) {
				return {
					...acc,
					mobile: acc.mobile + 1
				};
			}

			return {
				...acc,
				desktop: acc.desktop + 1
			};
		},
		{
			mobile: 0,
			desktop: 0,
			others: 0
		}
	);

	return {
		mobile: total > 0 ? mobile / total : 0,
		desktop: total > 0 ? desktop / total : 0,
		others: total > 0 ? others / total : 0
	};
};
