<script lang="ts">
	import CanisterSettings from '$lib/components/modules/canister/settings/CanisterSettings.svelte';
	import Snapshots from '$lib/components/modules/snapshot/Snapshots.svelte';
	import SatelliteAccessKeys from '$lib/components/satellites/setup/SatelliteAccessKeys.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';

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

<SatelliteAccessKeys {satellite} />

<Snapshots
	canisterId={satellite.satellite_id}
	segment="satellite"
	segmentLabel={$i18n.satellites.satellite}
/>
