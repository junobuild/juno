<script lang="ts">
	import LaunchpadSatellite from '$lib/components/launchpad/LaunchpadSatellite.svelte';
	import LaunchpadToolbar from '$lib/components/launchpad/LaunchpadToolbar.svelte';
	import { sortedSatelliteUis } from '$lib/derived/satellites.derived';
	import { satelliteMatchesFilter } from '$lib/utils/satellite.utils';
	import LaunchpadMonitoring from '$lib/components/launchpad/LaunchpadMonitoring.svelte';
	import LaunchpadAnalytics from '$lib/components/launchpad/LaunchpadAnalytics.svelte';

	let filter = $state('');

	let satellites = $derived(
		$sortedSatelliteUis.filter((satellite) =>
			satelliteMatchesFilter({ satellite, filter: filter.toLowerCase() })
		)
	);
</script>

<LaunchpadToolbar bind:filter />

<LaunchpadMonitoring />

<LaunchpadAnalytics />

{#each satellites as satellite (satellite.satellite_id.toText())}
	<LaunchpadSatellite {satellite} />
{/each}
