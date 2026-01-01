<script lang="ts">
	import CanisterSettings from '$lib/components/canister/settings/CanisterSettings.svelte';
	import MissionControlAccessKeys from '$lib/components/mission-control/setup/MissionControlAccessKeys.svelte';
	import Snapshots from '$lib/components/snapshot/Snapshots.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
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

<MissionControlAccessKeys {missionControlId} />

<Snapshots
	canisterId={missionControlId}
	segment="mission_control"
	segmentLabel={$i18n.mission_control.title}
/>
