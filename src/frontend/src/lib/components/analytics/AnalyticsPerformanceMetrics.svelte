<script lang="ts">
	import type {
		AnalyticsWebVitalsPageMetrics,
		AnalyticsWebVitalsPerformanceMetrics
	} from '$declarations/orbiter/orbiter.did';
	import AnalyticsPerformanceMetricsFilter from '$lib/components/analytics/AnalyticsPerformanceMetricsFilter.svelte';
	import AnalyticsPerformanceMetricsPage from '$lib/components/analytics/AnalyticsPerformanceMetricsPage.svelte';

	interface Props {
		performanceMetrics: AnalyticsWebVitalsPerformanceMetrics;
	}

	let { performanceMetrics }: Props = $props();

	let page: AnalyticsWebVitalsPageMetrics | undefined = $state(undefined);

	let metrics: AnalyticsWebVitalsPageMetrics = $derived(page ?? performanceMetrics.overall);
</script>

<AnalyticsPerformanceMetricsFilter {performanceMetrics} bind:page />

<AnalyticsPerformanceMetricsPage {metrics} />
