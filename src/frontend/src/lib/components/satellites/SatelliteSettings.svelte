<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import SatelliteControllers from '$lib/components/satellites/SatelliteControllers.svelte';
	import CanisterParameters from '$lib/components/canister/CanisterParameters.svelte';

	export let satellite: Satellite;
</script>

<CanisterParameters canisterId={satellite.satellite_id} segment="satellite" />

<SatelliteControllers {satellite} />
