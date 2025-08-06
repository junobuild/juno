<script lang="ts">
	import SegmentReload from '$lib/components/segments/SegmentReload.svelte';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { reloadMissionControlVersion } from '$lib/services/version/version.mission-control.services';

	interface Props {
		missionControlId: MissionControlId;
		onreload: () => void;
	}

	let { onreload, missionControlId }: Props = $props();

	const reloadVersion = async () => {
		onreload();

		await reloadMissionControlVersion({ missionControlId });
	};
</script>

<SegmentReload {reloadVersion} />
