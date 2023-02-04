<script lang="ts">
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import SatelliteArticle from '$lib/components/satellites/SatelliteArticle.svelte';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { satellitesStore } from '$lib/stores/satellite.store';
	import SatelliteNew from '$lib/components/satellites/SatelliteNew.svelte';
	import { nonNullish } from '$lib/utils/utils';
	import SatelliteArticleSkeleton from '$lib/components/satellites/SatelliteArticleSkeleton.svelte';

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
</script>

{#if !loading}
	<SatelliteNew />

	{#each $satellitesStore as satellite}
		<SatelliteArticle {satellite} />
	{/each}
{:else}
	<SatelliteArticleSkeleton />
{/if}
