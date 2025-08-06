<script lang="ts">
	import SegmentReload from '$lib/components/segments/SegmentReload.svelte';
	import { reloadMissionControlVersion } from '$lib/services/version/version.mission-control.services';
	import type { MissionControlId } from '$lib/types/mission-control';

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
