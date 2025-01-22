import { satellitesUncertifiedStore } from '$lib/stores/satellite.store';
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
