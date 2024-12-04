<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import CanisterSettings from '$lib/components/canister/CanisterSettings.svelte';
	import MissionControlControllers from '$lib/components/mission-control/MissionControlControllers.svelte';
	import Snapshots from '$lib/components/snapshot/Snapshots.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		missionControlId: Principal;
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
