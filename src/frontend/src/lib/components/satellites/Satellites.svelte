<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import SatelliteArticle from '$lib/components/satellites/SatelliteArticle.svelte';
	import SatelliteNew from '$lib/components/satellites/SatelliteNew.svelte';
	import SatellitesToolbar from '$lib/components/satellites/SatellitesToolbar.svelte';
	import { sortedSatelliteUis } from '$lib/derived/satellites.derived';
	import { layoutSatellites } from '$lib/stores/layout-launchpad.store';
	import { SatellitesLayout } from '$lib/types/layout';
	import { satelliteMatchesFilter } from '$lib/utils/satellite.utils';

	let filter = $state('');

	let satellites = $derived(
		$sortedSatelliteUis.filter((satellite) =>
			satelliteMatchesFilter({ satellite, filter: filter.toLowerCase() })
		)
	);
</script>

<SatellitesToolbar bind:filter />

<SatelliteNew row={$layoutSatellites === SatellitesLayout.LIST} />

{#each satellites as satellite (satellite.satellite_id.toText())}
	<SatelliteArticle {satellite} />
{/each}
