<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import MissionControlControllers from '$lib/components/mission-control/MissionControlControllers.svelte';
	import CanisterParameters from '$lib/components/canister/CanisterParameters.svelte';

	export let missionControlId: Principal;
</script>

<CanisterParameters canisterId={missionControlId} segment="mission_control" />

<MissionControlControllers {missionControlId} />
