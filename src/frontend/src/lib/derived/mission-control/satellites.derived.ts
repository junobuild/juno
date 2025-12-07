import { satellitesUncertifiedStore } from '$lib/stores/mission-control/satellites.store';
import { derived } from 'svelte/store';

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
