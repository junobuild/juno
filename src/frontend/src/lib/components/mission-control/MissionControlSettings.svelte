<script lang="ts">
	import CanisterSettings from '$lib/components/canister/CanisterSettings.svelte';
	import MissionControlControllers from '$lib/components/mission-control/MissionControlControllers.svelte';
	import Snapshots from '$lib/components/snapshot/Snapshots.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();
</script>

<CanisterSettings
	canisterId={missionControlId}
	segment="mission_control"
	segmentLabel={$i18n.mission_control.title}
/>

<MissionControlControllers {missionControlId} />

<Snapshots
	canisterId={missionControlId}
	segment="mission_control"
	segmentLabel={$i18n.mission_control.title}
/>
