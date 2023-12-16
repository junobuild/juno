<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CyclesWarning from '$lib/components/warning/CyclesWarning.svelte';
	import VersionWarning from '$lib/components/warning/VersionWarnings.svelte';
	import CanisterCyclesWarning from '$lib/components/canister/CanisterCyclesWarning.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';

	export let satellite: Satellite | undefined = undefined;
</script>

<VersionWarning {satellite} />

{#if nonNullish($missionControlStore)}
	<CyclesWarning canisterId={$missionControlStore}>
		{$i18n.canisters.warning_mission_control_low_cycles}
	</CyclesWarning>
{/if}

{#if nonNullish(satellite)}
	<CanisterCyclesWarning canisterId={satellite.satellite_id}>
		{$i18n.canisters.warning_satellite_low_cycles}
	</CanisterCyclesWarning>
{/if}

{#if nonNullish($orbiterStore)}
	<CyclesWarning canisterId={$orbiterStore.orbiter_id}>
		{$i18n.canisters.warning_orbiter_low_cycles}
	</CyclesWarning>
{/if}
