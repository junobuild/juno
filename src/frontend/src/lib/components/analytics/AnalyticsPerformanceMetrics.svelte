<script lang="ts">
	import type { OrbiterDid } from '$lib/types/declarations';
	import AnalyticsPerformanceMetricsFilter from '$lib/components/analytics/AnalyticsPerformanceMetricsFilter.svelte';
	import AnalyticsPerformanceMetricsPage from '$lib/components/analytics/AnalyticsPerformanceMetricsPage.svelte';

	interface Props {
		performanceMetrics: OrbiterDid.AnalyticsWebVitalsPerformanceMetrics;
	}

	let { performanceMetrics }: Props = $props();

	let page: OrbiterDid.AnalyticsWebVitalsPageMetrics | undefined = $state(undefined);

	let metrics: OrbiterDid.AnalyticsWebVitalsPageMetrics = $derived(
		page ?? performanceMetrics.overall
	);
</script>

<AnalyticsPerformanceMetricsFilter {performanceMetrics} bind:page />

<AnalyticsPerformanceMetricsPage {metrics} />
