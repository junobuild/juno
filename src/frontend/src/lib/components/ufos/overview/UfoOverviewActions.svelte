<script lang="ts">
	import DetachSegment from '$lib/components/modules/attach-detach/DetachSegment.svelte';
	import SegmentActions from '$lib/components/modules/segments/SegmentActions.svelte';
	import SegmentWithMetadataEditDetails from '$lib/components/modules/segments/SegmentWithMetadataEditDetails.svelte';
	import SatelliteReloadVersion from '$lib/components/satellites/overview/SatelliteReloadVersion.svelte';
	import SatelliteVisit from '$lib/components/satellites/overview/SatelliteVisit.svelte';
	import type { Satellite } from '$lib/types/satellite';
	import {
		type SetMetadataParams,
		type SetMetadataResult,
		setSatelliteMetadata,
		setUfoMetadata
	} from '$lib/services/metadata.services';
	import type { Ufo } from '$lib/types/ufo';

	interface Props {
		ufo: Ufo;
		monitoringEnabled: boolean;
	}

	let { ufo, monitoringEnabled }: Props = $props();

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	const updateMetadata = (params: SetMetadataParams): Promise<SetMetadataResult> =>
		setUfoMetadata({
			...params,
			ufo
		});
</script>

<SegmentActions bind:visible>
	{#snippet moreActions()}
		<SegmentWithMetadataEditDetails segment={ufo} {updateMetadata} />
	{/snippet}
</SegmentActions>
