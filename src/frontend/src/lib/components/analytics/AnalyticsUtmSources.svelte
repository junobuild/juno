<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import AnalyticsTable from '$lib/components/analytics/AnalyticsTable.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { top10 } = $derived(pageViews);

	let utmSources = $derived(fromNullable(top10.utm_sources));
</script>

{#if nonNullish(utmSources) && utmSources.length > 0}
	<AnalyticsTable events={utmSources}>
		{$i18n.analytics.utm_sources}
	</AnalyticsTable>
{/if}
