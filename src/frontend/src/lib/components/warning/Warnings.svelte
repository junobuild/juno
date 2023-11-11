<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import MissionControlCyclesWarning from '$lib/components/mission-control/MissionControlCyclesWarning.svelte';
	import VersionWarning from '$lib/components/warning/VersionWarnings.svelte';
	import CanisterCyclesWarning from '$lib/components/canister/CanisterCyclesWarning.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';

	export let satellite: Satellite | undefined = undefined;
</script>

<VersionWarning {satellite} />

{#if nonNullish($missionControlStore)}
	<MissionControlCyclesWarning missionControlId={$missionControlStore} />
{/if}

{#if nonNullish(satellite)}
	<CanisterCyclesWarning canisterId={satellite.satellite_id}>
		Your satellite is running low on cycles.
	</CanisterCyclesWarning>
{/if}
