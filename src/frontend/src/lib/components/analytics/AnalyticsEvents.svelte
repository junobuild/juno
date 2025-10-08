<script lang="ts">
	import AnalyticsTable from '$lib/components/analytics/AnalyticsTable.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { OrbiterDid } from '$lib/types/declarations';

	interface Props {
		trackEvents: OrbiterDid.AnalyticsTrackEvents;
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
