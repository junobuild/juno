<script lang="ts">
	import LaunchpadAnalytics from '$lib/components/modules/launchpad/LaunchpadAnalytics.svelte';
	import LaunchpadFirstSatellite from '$lib/components/modules/launchpad/LaunchpadFirstSatellite.svelte';
	import LaunchpadMonitoring from '$lib/components/modules/launchpad/LaunchpadMonitoring.svelte';
	import LaunchpadSatellite from '$lib/components/modules/launchpad/LaunchpadSatellite.svelte';
	import LaunchpadUfo from '$lib/components/modules/launchpad/LaunchpadUfo.svelte';
	import { sortedSatelliteUis } from '$lib/derived/satellites.derived';
	import { sortedUfoUis } from '$lib/derived/ufos.derived';
	import { satelliteMatchesFilter } from '$lib/utils/satellite.utils';
	import { ufoMatchesFilter } from '$lib/utils/ufo.utils';

	interface Props {
		filter: string;
	}

	let { filter }: Props = $props();

	let satellites = $derived(
		$sortedSatelliteUis.filter((satellite) =>
			satelliteMatchesFilter({ satellite, filter: filter.toLowerCase() })
		)
	);

	let ufos = $derived(
		$sortedUfoUis.filter((ufo) => ufoMatchesFilter({ ufo, filter: filter.toLowerCase() }))
	);
</script>

{#if (satellites?.length ?? 0n) === 0}
	<LaunchpadFirstSatellite />
{/if}

<LaunchpadMonitoring />

<LaunchpadAnalytics />

{#each satellites as satellite (satellite.satellite_id.toText())}
	<LaunchpadSatellite {satellite} />
{/each}

{#each ufos as ufo (ufo.ufo_id.toText())}
	<LaunchpadUfo {ufo} />
{/each}
