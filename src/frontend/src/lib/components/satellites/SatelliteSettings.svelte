<script lang="ts">
	import CanisterSettings from '$lib/components/canister/CanisterSettings.svelte';
	import SatelliteControllers from '$lib/components/satellites/SatelliteControllers.svelte';
	import Snapshots from '$lib/components/snapshot/Snapshots.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlDid } from '$lib/types/declarations';

	interface Props {
		satellite: MissionControlDid.Satellite;
	}

	let { satellite }: Props = $props();
</script>

<CanisterSettings
	canisterId={satellite.satellite_id}
	segment="satellite"
	segmentLabel={$i18n.satellites.satellite}
/>

<SatelliteControllers {satellite} />

<Snapshots
	canisterId={satellite.satellite_id}
	segment="satellite"
	segmentLabel={$i18n.satellites.satellite}
/>
