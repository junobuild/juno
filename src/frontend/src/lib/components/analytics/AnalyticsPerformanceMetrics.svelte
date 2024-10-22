<script lang="ts">
	import type {
		AnalyticsWebVitalsPageMetrics,
		AnalyticsWebVitalsPerformanceMetrics
	} from '$declarations/orbiter/orbiter.did';
	import AnalyticsPerformanceMetricsFilter from '$lib/components/analytics/AnalyticsPerformanceMetricsFilter.svelte';
	import AnalyticsPerformanceMetricsPage from '$lib/components/analytics/AnalyticsPerformanceMetricsPage.svelte';

	export let performanceMetrics: AnalyticsWebVitalsPerformanceMetrics;

	let page: AnalyticsWebVitalsPageMetrics | undefined = undefined;

	let metrics: AnalyticsWebVitalsPageMetrics;
	$: metrics = page ?? performanceMetrics.overall;
</script>

<AnalyticsPerformanceMetricsFilter bind:page {performanceMetrics} />

<AnalyticsPerformanceMetricsPage {metrics} />
