<script lang="ts">
	import type { AnalyticsWebVitalsPerformanceMetrics } from '$declarations/orbiter/orbiter.did';
	import AnalyticsPerformancePageMetrics from '$lib/components/analytics/AnalyticsPerformancePageMetrics.svelte';

	export let performanceMetrics: AnalyticsWebVitalsPerformanceMetrics;

	let metrics: AnalyticsPerformancePageMetrics;

	$: metrics = performanceMetrics.overall;
</script>

<AnalyticsPerformancePageMetrics {metrics} />
