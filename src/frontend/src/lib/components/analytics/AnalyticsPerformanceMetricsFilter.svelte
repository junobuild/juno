<script lang="ts">
	import Toolbar from '$lib/components/ui/Toolbar.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { OrbiterDid } from '$lib/types/declarations';

	interface Props {
		performanceMetrics: OrbiterDid.AnalyticsWebVitalsPerformanceMetrics;
		page: OrbiterDid.AnalyticsWebVitalsPageMetrics | undefined;
	}

	let { performanceMetrics, page = $bindable() }: Props = $props();

	let { pages } = $derived(performanceMetrics);
</script>

<Toolbar>
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
</Toolbar>
