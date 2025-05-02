import type { AnalyticsPeriodicity } from '$lib/types/orbiter';

// A month
export const DEFAULT_ANALYTICS_PERIODICITY: { periodicity: AnalyticsPeriodicity } = {
	periodicity: 720
};

export const DEFAULT_FEATURES = {
	page_views: true,
	track_events: true,
	performance_metrics: false
};
