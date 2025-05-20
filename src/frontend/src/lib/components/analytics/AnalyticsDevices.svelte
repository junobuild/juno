<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import AnalyticsTable from '$lib/components/analytics/AnalyticsTable.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { clients } = $derived(pageViews);

	let { devices } = $derived(clients);

	let { mobile, tablet: tabletDid, desktop, laptop: laptopDid, others } = $derived(devices);

	let tablet = $derived(fromNullable(tabletDid));
	let laptop = $derived(fromNullable(laptopDid));

	let events: [string, number][] = $derived([
		[$i18n.analytics.mobile, mobile],
		...(nonNullish(tablet) && tablet > 0
			? [[$i18n.analytics.tablet, tablet] as [string, number]]
			: []),
		...(nonNullish(laptop) && laptop > 0
			? [[$i18n.analytics.laptop, laptop] as [string, number]]
			: []),
		[$i18n.analytics.desktop, desktop],
		...(nonNullish(others) && others > 0
			? [[$i18n.analytics.others, others] as [string, number]]
			: [])
	]);
</script>

<AnalyticsTable {events} display="percent">
	{$i18n.analytics.devices}
</AnalyticsTable>
