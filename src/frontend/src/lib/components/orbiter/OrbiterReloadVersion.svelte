<script lang="ts">
	import type { MissionControlDid } from '$declarations';
	import SegmentReload from '$lib/components/segments/SegmentReload.svelte';
	import { reloadOrbiterVersion } from '$lib/services/version/version.orbiter.services';

	interface Props {
		orbiter: MissionControlDid.Orbiter;
		onreload: () => void;
	}

	let { onreload, orbiter }: Props = $props();

	const reloadVersion = async () => {
		onreload();

		await reloadOrbiterVersion({ orbiterId: orbiter.orbiter_id });
	};
</script>

<SegmentReload {reloadVersion} />
