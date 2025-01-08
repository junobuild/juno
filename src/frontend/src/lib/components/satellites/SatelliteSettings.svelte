<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterMonitoringSettings from '$lib/components/canister/CanisterMonitoringSettings.svelte';
	import CanisterSettings from '$lib/components/canister/CanisterSettings.svelte';
	import SatelliteControllers from '$lib/components/satellites/SatelliteControllers.svelte';
	import Snapshots from '$lib/components/snapshot/Snapshots.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<CanisterSettings
	canisterId={satellite.satellite_id}
	segment="satellite"
	segmentLabel={$i18n.satellites.satellite}
/>

<SatelliteControllers {satellite} />

<CanisterMonitoringSettings
	canisterId={satellite.satellite_id}
	segment="satellite"
	segmentLabel={$i18n.satellites.satellite}
/>

<Snapshots
	canisterId={satellite.satellite_id}
	segment="satellite"
	segmentLabel={$i18n.satellites.satellite}
/>
