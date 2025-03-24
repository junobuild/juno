<script lang="ts">
	import type {
		AnalyticsWebVitalsPageMetrics,
		AnalyticsWebVitalsPerformanceMetrics
	} from '$declarations/orbiter/orbiter.did';
	import AnalyticsToolbar from '$lib/components/analytics/AnalyticsToolbar.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		performanceMetrics: AnalyticsWebVitalsPerformanceMetrics;
		page: AnalyticsWebVitalsPageMetrics | undefined;
	}

	let { performanceMetrics, page = $bindable() }: Props = $props();

	let { pages } = $derived(performanceMetrics);
</script>

<AnalyticsToolbar>
	{#snippet start()}
		<Value>
			{#snippet label()}
				{$i18n.analytics.web_vitals}
			{/snippet}

			<select id="page" name="page" bind:value={page}>
				<option value={undefined}>{$i18n.analytics.overall}</option>

				{#each pages as pageMetric (pageMetric[0])}
					<option value={pageMetric[1]}>{pageMetric[0]}</option>
				{/each}
			</select>
		</Value>
	{/snippet}
</AnalyticsToolbar>
