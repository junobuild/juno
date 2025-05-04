import type { AnalyticsTrackEvents } from '$declarations/orbiter/orbiter.did';
import { getAnalyticsTrackEvents } from '$lib/services/orbiters.services';
import type { PageViewsParams, PageViewsPeriod, PageViewsPeriods } from '$lib/types/orbiter';
import { batchAnalyticsRequests } from '$lib/utils/orbiter.paginated.utils';
import { buildAnalyticsPeriods } from '$lib/utils/orbiter.utils';

export const getAnalyticsTrackEventsForPeriods = async ({
	orbiterVersion,
	params
}: {
	params: PageViewsParams;
	orbiterVersion: string;
}): Promise<AnalyticsTrackEvents> => {
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
	periodsMetrics: AnalyticsTrackEvents[];
}): AnalyticsTrackEvents => {
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
}): Promise<AnalyticsTrackEvents[]> => {
	const fn = ({ period }: { period: Required<PageViewsPeriod> }): Promise<AnalyticsTrackEvents> =>
		getAnalyticsTrackEvents({
			orbiterVersion,
			params: {
				...params,
				...period
			}
		});

	return await batchAnalyticsRequests<AnalyticsTrackEvents>({
		periods,
		fn
	});
};
