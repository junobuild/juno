<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import SatelliteControllers from '$lib/components/satellites/SatelliteControllers.svelte';
	import CanisterSettings from '$lib/components/canister/CanisterSettings.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let satellite: Satellite;
</script>

<CanisterSettings
	canisterId={satellite.satellite_id}
	segment="satellite"
	segmentLabel={$i18n.satellites.satellite}
/>

<SatelliteControllers {satellite} />
