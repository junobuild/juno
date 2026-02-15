<script lang="ts">
	import DetachSegment from '$lib/components/modules/attach-detach/DetachSegment.svelte';
	import SegmentActions from '$lib/components/modules/segments/SegmentActions.svelte';
	import SatelliteEditDetails from '$lib/components/satellites/SatelliteEditDetails.svelte';
	import SatelliteReloadVersion from '$lib/components/satellites/SatelliteReloadVersion.svelte';
	import SatelliteVisit from '$lib/components/satellites/SatelliteVisit.svelte';
	import type { Satellite } from '$lib/types/satellite';

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
		<SatelliteEditDetails {satellite} />

		<DetachSegment
			{monitoringEnabled}
			ondetach={close}
			segment="satellite"
			segmentId={satellite.satellite_id}
		/>

		<SatelliteReloadVersion onreload={close} {satellite} />
	{/snippet}
</SegmentActions>
