<script lang="ts">
	import AttachOrbiter from '$lib/components/attach-detach/AttachOrbiter.svelte';
	import AttachSatellite from '$lib/components/attach-detach/AttachSatellite.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';

	let visible: boolean = $state(false);
	const close = () => (visible = false);
</script>

<SegmentActions bind:visible>
	{#snippet moreActions()}
		<AttachSatellite ondetach={close} />

		<AttachOrbiter ondetach={close} />
	{/snippet}
</SegmentActions>
