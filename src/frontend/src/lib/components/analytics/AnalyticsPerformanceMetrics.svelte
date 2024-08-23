<script lang="ts">
	import type {
		AnalyticsWebVitalsPageMetrics,
		AnalyticsWebVitalsPerformanceMetrics
	} from '$declarations/orbiter/orbiter.did';
	import AnalyticsPerformanceMetricsPage from '$lib/components/analytics/AnalyticsPerformanceMetricsPage.svelte';
	import AnalyticsPerformanceMetricsFilter from '$lib/components/analytics/AnalyticsPerformanceMetricsFilter.svelte';

	export let performanceMetrics: AnalyticsWebVitalsPerformanceMetrics;

	let page: AnalyticsWebVitalsPageMetrics | undefined = undefined;

	let metrics: AnalyticsWebVitalsPageMetrics;
	$: metrics = page ?? performanceMetrics.overall;
</script>

<AnalyticsPerformanceMetricsFilter bind:page {performanceMetrics} />

<AnalyticsPerformanceMetricsPage {metrics} />
