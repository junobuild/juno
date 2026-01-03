<script lang="ts">
	import type { MissionControlDid } from '$declarations';
	import DetachSegment from '$lib/components/attach-detach/DetachSegment.svelte';
	import OrbiterReloadVersion from '$lib/components/orbiter/OrbiterReloadVersion.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';

	interface Props {
		orbiter: MissionControlDid.Orbiter;
		monitoringEnabled: boolean;
	}

	let { orbiter, monitoringEnabled }: Props = $props();

	let visible: boolean = $state(false);
	const close = () => (visible = false);
</script>

<SegmentActions bind:visible>
	{#snippet moreActions()}
		<DetachSegment
			{monitoringEnabled}
			ondetach={close}
			segment="orbiter"
			segmentId={orbiter.orbiter_id}
		/>

		<OrbiterReloadVersion onreload={close} {orbiter} />
	{/snippet}
</SegmentActions>
