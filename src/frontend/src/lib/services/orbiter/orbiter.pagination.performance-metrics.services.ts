import { getAnalyticsPerformanceMetrics } from '$lib/services/orbiter/_orbiter.services';
import type { OrbiterDid } from '$lib/types/declarations';
import type { PageViewsParams, PageViewsPeriod, PageViewsPeriods } from '$lib/types/orbiter';
import { batchAnalyticsRequests } from '$lib/utils/orbiter.paginated.utils';
import { buildAnalyticsPeriods } from '$lib/utils/orbiter.utils';
import { fromNullable, nonNullish, toNullable } from '@dfinity/utils';

type OptionAnalyticsWebVitalsPerformanceMetrics =
	| OrbiterDid.AnalyticsWebVitalsPerformanceMetrics
	| undefined;

export const getAnalyticsPerformanceMetricsForPeriods = async ({
	orbiterVersion,
	params
}: {
	params: PageViewsParams;
	orbiterVersion: string;
}): Promise<OptionAnalyticsWebVitalsPerformanceMetrics> => {
	const periods = buildAnalyticsPeriods({ params });

	const periodsMetrics = await getPerformanceMetrics({
		orbiterVersion,
		params,
		periods
	});

	return aggregateMetrics({ periodsMetrics });
};

const aggregateMetrics = ({
	periodsMetrics
}: {
	periodsMetrics: OptionAnalyticsWebVitalsPerformanceMetrics[];
}): OptionAnalyticsWebVitalsPerformanceMetrics => {
	const metrics = periodsMetrics.filter(nonNullish);

	interface TotalMetrics {
		cls: { sum: number; count: number };
		fcp: { sum: number; count: number };
		inp: { sum: number; count: number };
		lcp: { sum: number; count: number };
		ttfb: { sum: number; count: number };
	}

	const totalMetrics = metrics.reduce<{
		overall: TotalMetrics;
		pages: Record<string, TotalMetrics>;
	}>(
		({ overall: accOverall, pages: accPages }, { overall, pages }) => {
			const overallCls = fromNullable(overall.cls);
			const overallFcp = fromNullable(overall.fcp);
			const overallInp = fromNullable(overall.inp);
			const overallLcp = fromNullable(overall.lcp);
			const overallTtfb = fromNullable(overall.ttfb);

			return {
				overall: {
					cls: {
						sum: accOverall.cls.sum + (overallCls ?? 0),
						count: accOverall.cls.count + (nonNullish(overallCls) ? 1 : 0)
					},
					fcp: {
						sum: accOverall.fcp.sum + (overallFcp ?? 0),
						count: accOverall.fcp.count + (nonNullish(overallFcp) ? 1 : 0)
					},
					inp: {
						sum: accOverall.inp.sum + (overallInp ?? 0),
						count: accOverall.inp.count + (nonNullish(overallInp) ? 1 : 0)
					},
					lcp: {
						sum: accOverall.lcp.sum + (overallLcp ?? 0),
						count: accOverall.lcp.count + (nonNullish(overallLcp) ? 1 : 0)
					},
					ttfb: {
						sum: accOverall.ttfb.sum + (overallTtfb ?? 0),
						count: accOverall.ttfb.count + (nonNullish(overallTtfb) ? 1 : 0)
					}
				},
				pages: {
					...accPages,
					...pages.reduce<Record<string, TotalMetrics>>((acc, [urlPath, metrics]) => {
						const existing = acc[urlPath] ?? {
							cls: { sum: 0, count: 0 },
							fcp: { sum: 0, count: 0 },
							inp: { sum: 0, count: 0 },
							lcp: { sum: 0, count: 0 },
							ttfb: { sum: 0, count: 0 }
						};

						const cls = fromNullable(metrics.cls);
						const fcp = fromNullable(metrics.fcp);
						const inp = fromNullable(metrics.inp);
						const lcp = fromNullable(metrics.lcp);
						const ttfb = fromNullable(metrics.ttfb);

						return {
							...acc,
							[urlPath]: {
								cls: {
									sum: existing.cls.sum + (cls ?? 0),
									count: existing.cls.count + (nonNullish(cls) ? 1 : 0)
								},
								fcp: {
									sum: existing.fcp.sum + (fcp ?? 0),
									count: existing.fcp.count + (nonNullish(fcp) ? 1 : 0)
								},
								inp: {
									sum: existing.inp.sum + (inp ?? 0),
									count: existing.inp.count + (nonNullish(inp) ? 1 : 0)
								},
								lcp: {
									sum: existing.lcp.sum + (lcp ?? 0),
									count: existing.lcp.count + (nonNullish(lcp) ? 1 : 0)
								},
								ttfb: {
									sum: existing.ttfb.sum + (ttfb ?? 0),
									count: existing.ttfb.count + (nonNullish(ttfb) ? 1 : 0)
								}
							}
						};
					}, accPages)
				}
			};
		},
		{
			overall: {
				cls: { sum: 0, count: 0 },
				fcp: { sum: 0, count: 0 },
				inp: { sum: 0, count: 0 },
				lcp: { sum: 0, count: 0 },
				ttfb: { sum: 0, count: 0 }
			},
			pages: {}
		}
	);

	const overall = {
		cls: toNullable(
			totalMetrics.overall.cls.count > 0
				? totalMetrics.overall.cls.sum / totalMetrics.overall.cls.count
				: undefined
		),
		fcp: toNullable(
			totalMetrics.overall.fcp.count > 0
				? totalMetrics.overall.fcp.sum / totalMetrics.overall.fcp.count
				: undefined
		),
		inp: toNullable(
			totalMetrics.overall.inp.count > 0
				? totalMetrics.overall.inp.sum / totalMetrics.overall.inp.count
				: undefined
		),
		lcp: toNullable(
			totalMetrics.overall.lcp.count > 0
				? totalMetrics.overall.lcp.sum / totalMetrics.overall.lcp.count
				: undefined
		),
		ttfb: toNullable(
			totalMetrics.overall.ttfb.count > 0
				? totalMetrics.overall.ttfb.sum / totalMetrics.overall.ttfb.count
				: undefined
		)
	};

	const pages = Object.entries(totalMetrics.pages).map<
		[string, OrbiterDid.AnalyticsWebVitalsPageMetrics]
	>(([path, total]) => [
		path,
		{
			cls: toNullable(total.cls.count > 0 ? total.cls.sum / total.cls.count : undefined),
			fcp: toNullable(total.fcp.count > 0 ? total.fcp.sum / total.fcp.count : undefined),
			inp: toNullable(total.inp.count > 0 ? total.inp.sum / total.inp.count : undefined),
			lcp: toNullable(total.lcp.count > 0 ? total.lcp.sum / total.lcp.count : undefined),
			ttfb: toNullable(total.ttfb.count > 0 ? total.ttfb.sum / total.ttfb.count : undefined)
		}
	]);

	return { overall, pages };
};

const getPerformanceMetrics = async ({
	orbiterVersion,
	params,
	periods
}: {
	params: PageViewsParams;
	orbiterVersion: string;
	periods: PageViewsPeriods;
}): Promise<OptionAnalyticsWebVitalsPerformanceMetrics[]> => {
	const fn = ({
		period
	}: {
		period: Required<PageViewsPeriod>;
	}): Promise<OptionAnalyticsWebVitalsPerformanceMetrics> =>
		getAnalyticsPerformanceMetrics({
			orbiterVersion,
			params: {
				...params,
				...period
			}
		});

	return await batchAnalyticsRequests<OptionAnalyticsWebVitalsPerformanceMetrics>({
		periods,
		fn
	});
};
