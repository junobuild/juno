<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import SatelliteStopStart from '$lib/components/satellites/SatelliteStopStart.svelte';
	import SatelliteDelete from '$lib/components/satellites/SatelliteDelete.svelte';

	export let satellite: Satellite;

	let detail = { satellite };
</script>

<TopUp type="topup_satellite" {detail} />

<SatelliteStopStart {satellite} />

<SatelliteDelete {satellite} />
