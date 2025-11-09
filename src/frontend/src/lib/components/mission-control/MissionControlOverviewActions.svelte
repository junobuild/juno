<script lang="ts">
	import MissionControlAttachOrbiter from '$lib/components/mission-control/MissionControlAttachOrbiter.svelte';
	import MissionControlAttachSatellite from '$lib/components/mission-control/MissionControlAttachSatellite.svelte';
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
		<MissionControlAttachSatellite on:junoAttach={close} />

		<MissionControlAttachOrbiter on:junoAttach={close} />

		<MissionControlReloadVersion {missionControlId} onreload={close} />
	{/snippet}
</SegmentActions>
