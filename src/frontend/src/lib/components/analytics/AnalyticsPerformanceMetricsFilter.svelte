<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import AnalyticsToolbar from '$lib/components/analytics/AnalyticsToolbar.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import type {
		AnalyticsWebVitalsPageMetrics,
		AnalyticsWebVitalsPerformanceMetrics
	} from '$declarations/orbiter/orbiter.did';

	export let performanceMetrics: AnalyticsWebVitalsPerformanceMetrics;
	export let page: AnalyticsWebVitalsPageMetrics | undefined;

	let pages: [string, AnalyticsWebVitalsPageMetrics][];
	$: ({ pages } = performanceMetrics);
</script>

<AnalyticsToolbar>
	<Value slot="start">
		<svelte:fragment slot="label">{$i18n.analytics.web_vitals}</svelte:fragment>

		<select id="page" name="page" bind:value={page}>
			<option value={undefined}>{$i18n.analytics.overall}</option>

			{#each pages as pageMetric}
				<option value={pageMetric[1]}>{pageMetric[0]}</option>
			{/each}
		</select>
	</Value>
</AnalyticsToolbar>
