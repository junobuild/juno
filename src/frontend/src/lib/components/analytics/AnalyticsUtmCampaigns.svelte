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

	let utmCampaigns = $derived(fromNullable(top10.utm_campaigns));
</script>

{#if nonNullish(utmCampaigns) && utmCampaigns.length > 0}
	<AnalyticsTable events={utmCampaigns}>
		{$i18n.analytics.utm_campaigns}
	</AnalyticsTable>
{/if}
