<script lang="ts">
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import OrbiterReloadVersion from '$lib/components/orbiter/OrbiterReloadVersion.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import type { MissionControlDid } from '$lib/types/declarations';

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
		<SegmentDetach
			{monitoringEnabled}
			ondetach={close}
			segment="orbiter"
			segmentId={orbiter.orbiter_id}
		/>

		<OrbiterReloadVersion onreload={close} {orbiter} />
	{/snippet}
</SegmentActions>
