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

	let { operating_systems } = $derived(clients);

	let { android, ios, linux, macos, others, windows } = $derived(
		operating_systems ?? {
			android: 0,
			ios: 0,
			linux: 0,
			macos: 0,
			others: 0,
			windows: 0
		}
	);

	let events: [string, number][] = $derived([
		['Android', android],
		['iOS', ios],
		['Windows', windows],
		['Mac', macos],
		['Linux', linux],
		[$i18n.analytics.others, others]
	]);
</script>

{#if nonNullish(operating_systems)}
	<AnalyticsTable display="percent" {events}>
		{$i18n.analytics.operating_systems}
	</AnalyticsTable>
{/if}
