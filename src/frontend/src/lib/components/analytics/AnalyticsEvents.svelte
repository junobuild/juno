<script lang="ts">
	import type { AnalyticsTrackEvents } from '$declarations/orbiter/orbiter.did';
	import AnalyticsTable from '$lib/components/analytics/AnalyticsTable.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		trackEvents: AnalyticsTrackEvents;
	}

	let { trackEvents }: Props = $props();

	let allEvents = $derived(trackEvents.total);
</script>

<div>
	<AnalyticsTable events={allEvents}>
		{$i18n.analytics.tracked_events}
	</AnalyticsTable>
</div>

<style lang="scss">
	div {
		margin: var(--padding-4x) 0;
	}
</style>
