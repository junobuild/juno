<script lang="ts">
	import MissionControlAttachOrbiter from '$lib/components/mission-control/MissionControlAttachOrbiter.svelte';
	import MissionControlAttachSatellite from '$lib/components/mission-control/MissionControlAttachSatellite.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';

	let visible: boolean = $state(false);
	const close = () => (visible = false);
</script>

<SegmentActions bind:visible>
	{#snippet moreActions()}
		<MissionControlAttachSatellite on:junoAttach={close} />

		<MissionControlAttachOrbiter on:junoAttach={close} />
	{/snippet}
</SegmentActions>
