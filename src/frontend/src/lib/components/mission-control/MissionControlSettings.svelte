<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import MissionControlControllers from '$lib/components/mission-control/MissionControlControllers.svelte';
	import CanisterSettings from '$lib/components/canister/CanisterSettings.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let missionControlId: Principal;
</script>

<CanisterSettings
	canisterId={missionControlId}
	segment="mission_control"
	segmentLabel={$i18n.mission_control.title}
/>

<MissionControlControllers {missionControlId} />
