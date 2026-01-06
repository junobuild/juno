<script lang="ts">
	import LaunchpadAnalytics from '$lib/components/launchpad/LaunchpadAnalytics.svelte';
	import LaunchpadMonitoring from '$lib/components/launchpad/LaunchpadMonitoring.svelte';
	import LaunchpadSatellite from '$lib/components/launchpad/LaunchpadSatellite.svelte';
	import LaunchpadToolbar from '$lib/components/launchpad/LaunchpadToolbar.svelte';
	import { sortedSatelliteUis } from '$lib/derived/satellites.derived';
	import { satelliteMatchesFilter } from '$lib/utils/satellite.utils';
	import { sortedCanisterUis } from '$lib/derived/console/canisters.derived';
	import type { SatelliteUi } from '$lib/types/satellite';
	import LaunchpadCanister from '$lib/components/launchpad/LaunchpadCanister.svelte';
	import { segments } from '$lib/derived/console/segments.derived';

	let filter = $state('');

	let satellites = $derived(
		$sortedSatelliteUis.filter((satellite) =>
			satelliteMatchesFilter({ satellite, filter: filter.toLowerCase() })
		)
	);

	let canisters = $derived(
		$sortedCanisterUis.filter((canister) =>
			// TODO: make generic
			satelliteMatchesFilter({
				satellite: { ...canister, satellite_id: canister.canisterId } as unknown as SatelliteUi,
				filter: filter.toLowerCase()
			})
		)
	);
</script>

<LaunchpadToolbar bind:filter />

<LaunchpadMonitoring />

<LaunchpadAnalytics />

{#each satellites as satellite (satellite.satellite_id.toText())}
	<LaunchpadSatellite {satellite} />
{/each}

{#each canisters as canister (canister.canisterId.toText())}
	<LaunchpadCanister {canister} />
{/each}
