<script lang="ts">
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import OrbiterReloadVersion from '$lib/components/orbiter/OrbiterReloadVersion.svelte';

	interface Props {
		orbiter: Orbiter;
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

		<OrbiterReloadVersion {orbiter} onreload={close} />
	{/snippet}
</SegmentActions>
