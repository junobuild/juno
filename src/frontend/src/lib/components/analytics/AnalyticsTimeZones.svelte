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

	let timeZones = $derived(fromNullable(top10.time_zones));
</script>

{#if nonNullish(timeZones) && timeZones.length > 0}
	<AnalyticsTable events={timeZones}>
		{$i18n.analytics.time_zones}
	</AnalyticsTable>
{/if}
