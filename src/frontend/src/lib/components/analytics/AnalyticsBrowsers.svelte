<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import AnalyticsTable from '$lib/components/analytics/AnalyticsTable.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { clients } = $derived(pageViews);

	let { browsers } = $derived(clients);

	let { safari, opera, others, firefox, chrome } = $derived(
		browsers ?? {
			safari: 0,
			opera: 0,
			others: 0,
			firefox: 0,
			chrome: 0
		}
	);

	let events: [string, number][] = $derived([
		['Chrome', chrome],
		['Safari', safari],
		['Firefox', firefox],
		['Opera', opera],
		[$i18n.analytics.others, others]
	]);
</script>

{#if nonNullish(browsers)}
	<AnalyticsTable display="percent" {events}>
		{$i18n.analytics.browsers}
	</AnalyticsTable>
{/if}
