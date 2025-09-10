import { satellitesUncertifiedStore } from '$lib/stores/satellite.store';
import type { SatelliteUi } from '$lib/types/satellite';
import { satelliteMetadata, satelliteName } from '$lib/utils/satellite.utils';
import { derived } from 'svelte/store';

// TODO: rename without suffix store but find another naming that satellite and satelliteId because we probably already use those for local variable.

export const satellitesStore = derived(
	[satellitesUncertifiedStore],
	([$satellitesDataStore]) => $satellitesDataStore?.data
);

export const satellitesLoaded = derived(
	[satellitesUncertifiedStore],
	([$satellitesDataStore]) => $satellitesDataStore !== undefined
);

export const satellitesNotLoaded = derived(
	[satellitesLoaded],
	([$satellitesLoaded]) => !$satellitesLoaded
);

export const sortedSatellites = derived([satellitesStore], ([$satellitesStore]) =>
	($satellitesStore ?? []).sort((a, b) => satelliteName(a).localeCompare(satelliteName(b)))
);

export const sortedSatelliteUis = derived([sortedSatellites], ([$sortedSatellites]) =>
	$sortedSatellites.map<SatelliteUi>((satellite) => ({
		...satellite,
		metadata: satelliteMetadata(satellite)
	}))
);
