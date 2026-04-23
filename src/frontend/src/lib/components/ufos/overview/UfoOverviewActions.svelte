<script lang="ts">
	import SegmentActions from '$lib/components/modules/segments/SegmentActions.svelte';
	import SegmentWithMetadataEditDetails from '$lib/components/modules/segments/SegmentWithMetadataEditDetails.svelte';
	import {
		type SetMetadataParams,
		type SetMetadataResult,
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
