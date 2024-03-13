<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterJunoStatuses from '$lib/components/canister/CanisterJunoStatuses.svelte';

	export let satellite: Satellite;
</script>

<CanisterJunoStatuses segment="satellite" canisterId={satellite.satellite_id} />
