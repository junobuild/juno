<script lang="ts">
	import MissionControlReloadVersion from '$lib/components/mission-control/MissionControlReloadVersion.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let visible: boolean = $state(false);
	const close = () => (visible = false);
</script>

<SegmentActions bind:visible>
	{#snippet moreActions()}
		<MissionControlReloadVersion {missionControlId} onreload={close} />
	{/snippet}
</SegmentActions>
