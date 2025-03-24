<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import SatelliteArticle from '$lib/components/satellites/SatelliteArticle.svelte';
	import SatelliteNew from '$lib/components/satellites/SatelliteNew.svelte';
	import SatellitesToolbar from '$lib/components/satellites/SatellitesToolbar.svelte';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
	import { layoutSatellites } from '$lib/stores/layout-launchpad.store';
	import { SatellitesLayout } from '$lib/types/layout';
	import { satelliteName } from '$lib/utils/satellite.utils';

	let filter = $state('');

	let satellites: Satellite[] = $derived(
		$sortedSatellites.filter(
			(satellite) =>
				satelliteName(satellite).toLowerCase().includes(filter.toLowerCase()) ||
				satellite.satellite_id.toText().includes(filter.toLowerCase())
		)
	);
</script>

<SatellitesToolbar bind:filter />

<SatelliteNew row={$layoutSatellites === SatellitesLayout.LIST} />

{#each satellites as satellite (satellite.satellite_id.toText())}
	<SatelliteArticle {satellite} />
{/each}
