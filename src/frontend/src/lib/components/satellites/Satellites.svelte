<script lang="ts">
	import SatelliteArticle from '$lib/components/satellites/SatelliteArticle.svelte';
	import SatellitesToolbar from '$lib/components/satellites/SatellitesToolbar.svelte';
	import { sortedSatelliteUis } from '$lib/derived/satellites.derived';
	import { satelliteMatchesFilter } from '$lib/utils/satellite.utils';

	let filter = $state('');

	let satellites = $derived(
		$sortedSatelliteUis.filter((satellite) =>
			satelliteMatchesFilter({ satellite, filter: filter.toLowerCase() })
		)
	);
</script>

<SatellitesToolbar bind:filter />

{#each satellites as satellite (satellite.satellite_id.toText())}
	<SatelliteArticle {satellite} />
{/each}
