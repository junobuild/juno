<script lang="ts">
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import SatelliteArticle from '$lib/components/satellites/SatelliteArticle.svelte';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { satellitesStore } from '$lib/stores/satellite.store';
	import SatelliteNew from '$lib/components/satellites/SatelliteNew.svelte';
	import { nonNullish } from '@dfinity/utils';
	import SatelliteArticleSkeleton from '$lib/components/satellites/SatelliteArticleSkeleton.svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import SatellitesToolbar from '$lib/components/satellites/SatellitesToolbar.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';

	$: $missionControlStore,
		(async () => await loadSatellites({ missionControl: $missionControlStore }))();

	let loading = true;
	$: (() => {
		if (nonNullish($satellitesStore)) {
			setTimeout(() => (loading = false), 500);
			return;
		}

		loading = true;
	})();

	let filter = '';

	let satellites: Satellite[];
	$: satellites = ($satellitesStore ?? []).filter(
		(satellite) =>
			satelliteName(satellite).toLowerCase().includes(filter.toLowerCase()) ||
			satellite.satellite_id.toText().includes(filter.toLowerCase())
	);
</script>

{#if !loading}
	<SatellitesToolbar bind:filter />

	<SatelliteNew />

	{#each satellites as satellite}
		<SatelliteArticle {satellite} />
	{/each}
{:else}
	<SatelliteArticleSkeleton />
{/if}
