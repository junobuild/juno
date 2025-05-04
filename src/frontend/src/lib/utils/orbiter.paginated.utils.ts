import type { PageViewsPeriod, PageViewsPeriods } from '$lib/types/orbiter';

export interface BatchPeriodsRequestsParams<Result> {
	periods: PageViewsPeriods;
	fn: (params: { period: Required<PageViewsPeriod> }) => Promise<Result>;
}

export const batchAnalyticsRequests = async <Result>(
	params: BatchPeriodsRequestsParams<Result>
): Promise<Result[]> => {
	let results: Result[] = [];

	for await (const batchResults of batchAnalyticsRequestsByGroupOfPeriods<Result>(params)) {
		results = [...results, ...batchResults];
	}

	return results;
};

async function* batchAnalyticsRequestsByGroupOfPeriods<Result>({
	periods,
	fn,
	limit = 12
}: {
	limit?: number;
} & BatchPeriodsRequestsParams<Result>): AsyncGenerator<Result[], void> {
	for (let i = 0; i < periods.length; i = i + limit) {
		const batch = periods.slice(i, i + limit);
		const result = await Promise.all(batch.map((period) => fn({ period })));
		yield result;
	}
}
