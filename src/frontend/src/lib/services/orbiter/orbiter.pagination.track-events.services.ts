import { getAnalyticsTrackEvents } from '$lib/services/orbiter/_orbiter.services';
import type { OrbiterDid } from '$lib/types/declarations';
import type { PageViewsParams, PageViewsPeriod, PageViewsPeriods } from '$lib/types/orbiter';
import { batchAnalyticsRequests } from '$lib/utils/orbiter.paginated.utils';
import { buildAnalyticsPeriods } from '$lib/utils/orbiter.utils';

export const getAnalyticsTrackEventsForPeriods = async ({
	orbiterVersion,
	params
}: {
	params: PageViewsParams;
	orbiterVersion: string;
}): Promise<OrbiterDid.AnalyticsTrackEvents> => {
	const periods = buildAnalyticsPeriods({ params });

	const periodsMetrics = await getTrackEvents({
		orbiterVersion,
		params,
		periods
	});

	return aggregateMetrics({ periodsMetrics });
};

const aggregateMetrics = ({
	periodsMetrics
}: {
	periodsMetrics: OrbiterDid.AnalyticsTrackEvents[];
}): OrbiterDid.AnalyticsTrackEvents => {
	const values = periodsMetrics.reduce<Record<string, number>>(
		(acc, { total }) => ({
			...acc,
			...total.reduce<Record<string, number>>(
				(accEvents, [key, value]) => ({
					...accEvents,
					[key]: value + (acc[key] ?? 0)
				}),
				{}
			)
		}),
		{}
	);

	return { total: Object.entries(values) };
};

const getTrackEvents = async ({
	orbiterVersion,
	params,
	periods
}: {
	params: PageViewsParams;
	orbiterVersion: string;
	periods: PageViewsPeriods;
}): Promise<OrbiterDid.AnalyticsTrackEvents[]> => {
	const fn = ({
		period
	}: {
		period: Required<PageViewsPeriod>;
	}): Promise<OrbiterDid.AnalyticsTrackEvents> =>
		getAnalyticsTrackEvents({
			orbiterVersion,
			params: {
				...params,
				...period
			}
		});

	return await batchAnalyticsRequests<OrbiterDid.AnalyticsTrackEvents>({
		periods,
		fn
	});
};
