import { satellitesUncertifiedStore } from '$lib/stores/mission-control/satellites.store';
import { satelliteName } from '$lib/utils/satellite.utils';
import { derived } from 'svelte/store';

export const satellitesStore = derived(
	[satellitesUncertifiedStore],
	([$satellitesDataStore]) => $satellitesDataStore?.data
);

export const sortedSatellites = derived([satellitesStore], ([$satellitesStore]) =>
	($satellitesStore ?? []).sort((a, b) => satelliteName(a).localeCompare(satelliteName(b)))
);

export const satellitesLoaded = derived(
	[satellitesUncertifiedStore],
	([$satellitesDataStore]) => $satellitesDataStore !== undefined
);

export const satellitesNotLoaded = derived(
	[satellitesLoaded],
	([$satellitesLoaded]) => !$satellitesLoaded
);
