<script lang="ts">
	import AnalyticsTable from '$lib/components/analytics/AnalyticsTable.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { top10 } = $derived(pageViews);

	let pages = $derived(top10.pages);
</script>

{#if pages.length > 0}
	<AnalyticsTable events={pages}>
		{$i18n.analytics.pages}
	</AnalyticsTable>
{/if}
