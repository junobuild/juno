<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import SatelliteArticle from '$lib/components/satellites/SatelliteArticle.svelte';
	import SatelliteNew from '$lib/components/satellites/SatelliteNew.svelte';
	import SatellitesToolbar from '$lib/components/satellites/SatellitesToolbar.svelte';
	import { sortedSatelliteUis } from '$lib/derived/satellites.derived';
	import { layoutSatellites } from '$lib/stores/layout-launchpad.store';
	import { SatellitesLayout } from '$lib/types/layout';

	let filter = $state('');

	let satellites = $derived(
		$sortedSatelliteUis.filter(
			({ satellite_id, metadata: { name, environment, tags } }) =>
				name.toLowerCase().includes(filter.toLowerCase()) ||
				satellite_id.toText().includes(filter.toLowerCase()) ||
				(notEmptyString(environment) && environment.includes(filter.toLowerCase())) ||
				(tags ?? []).find((tag) => tag.includes(filter.toLowerCase()))
		)
	);
</script>

<SatellitesToolbar bind:filter />

<SatelliteNew row={$layoutSatellites === SatellitesLayout.LIST} />

{#each satellites as satellite (satellite.satellite_id.toText())}
	<SatelliteArticle {satellite} />
{/each}
