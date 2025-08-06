<script lang="ts">
	import SegmentReload from '$lib/components/segments/SegmentReload.svelte';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import { reloadOrbiterVersion } from '$lib/services/version/version.orbiter.services';

	interface Props {
		orbiter: Orbiter;
		onreload: () => void;
	}

	let { onreload, orbiter }: Props = $props();

	const reloadVersion = async () => {
		onreload();

		await reloadOrbiterVersion({ orbiterId: orbiter.orbiter_id });
	};
</script>

<SegmentReload {reloadVersion} />
