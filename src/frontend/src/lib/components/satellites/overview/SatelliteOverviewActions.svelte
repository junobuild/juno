<script lang="ts">
	import DetachSegment from '$lib/components/modules/attach-detach/DetachSegment.svelte';
	import SegmentActions from '$lib/components/modules/segments/SegmentActions.svelte';
	import SegmentWithMetadataEditDetails from '$lib/components/modules/segments/SegmentWithMetadataEditDetails.svelte';
	import SatelliteReloadVersion from '$lib/components/satellites/overview/SatelliteReloadVersion.svelte';
	import SatelliteVisit from '$lib/components/satellites/overview/SatelliteVisit.svelte';
	import {
		type SetMetadataParams,
		type SetMetadataResult,
		setSatelliteMetadata
	} from '$lib/services/metadata.services';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
		monitoringEnabled: boolean;
	}

	let { satellite, monitoringEnabled }: Props = $props();

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	const updateMetadata = (params: SetMetadataParams): Promise<SetMetadataResult> =>
		setSatelliteMetadata({
			...params,
			satellite
		});
</script>

<SegmentActions bind:visible>
	{#snippet mainActions()}
		<SatelliteVisit {satellite} />
	{/snippet}

	{#snippet moreActions()}
		<SegmentWithMetadataEditDetails segment={satellite} {updateMetadata} />

		<DetachSegment
			{monitoringEnabled}
			ondetach={close}
			segment="satellite"
			segmentId={satellite.satellite_id}
		/>

		<SatelliteReloadVersion onreload={close} {satellite} />
	{/snippet}
</SegmentActions>
