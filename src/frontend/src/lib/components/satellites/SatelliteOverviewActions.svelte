<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import SatelliteEditName from '$lib/components/satellites/SatelliteEditName.svelte';
	import SatelliteVisit from '$lib/components/satellites/SatelliteVisit.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';

	interface Props {
		satellite: Satellite;
		monitoringEnabled: boolean;
	}

	let { satellite, monitoringEnabled }: Props = $props();

	let visible: boolean = $state(false);
	const close = () => (visible = false);
</script>

<SegmentActions bind:visible>
	{#snippet mainActions()}
		<SatelliteVisit {satellite} />
	{/snippet}

	{#snippet moreActions()}
		<SatelliteEditName {satellite} />

		<SegmentDetach
			segment="satellite"
			segmentId={satellite.satellite_id}
			{monitoringEnabled}
			ondetach={close}
		/>
	{/snippet}
</SegmentActions>
