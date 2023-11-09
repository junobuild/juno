<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import CanisterStopStart from '$lib/components/satellites/SatelliteStopStart.svelte';

	export let satellite: Satellite;

	let detail = { satellite };
</script>

<TopUp type="topup_satellite" {detail} />

<CanisterStopStart {satellite} />
