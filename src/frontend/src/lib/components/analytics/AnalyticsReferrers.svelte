<script lang="ts">
	import AnalyticsTable from '$lib/components/analytics/AnalyticsTable.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { top10 } = $derived(pageViews);

	let referrers = $derived(top10.referrers);
</script>

{#if referrers.length > 0}
	<AnalyticsTable events={referrers}>
		{$i18n.analytics.referrers}
	</AnalyticsTable>
{/if}
