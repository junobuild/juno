<script lang="ts">
	import MissionControlOverview from '$lib/components/mission-control/MissionControlOverview.svelte';
	import MissionControlSettings from '$lib/components/mission-control/setup/MissionControlSettings.svelte';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();
</script>

<MissionControlOverview {missionControlId} />

<MissionControlSettings {missionControlId} />
