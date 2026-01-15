import { satellitesUncertifiedStore } from '$lib/stores/mission-control/satellites.store';
import { sortSatellites } from '$lib/utils/satellite.utils';
import { derived } from 'svelte/store';

export const mctrlSatellites = derived(
	[satellitesUncertifiedStore],
	([$satellitesDataStore]) => $satellitesDataStore?.data
);

export const mctrlSortedSatellites = derived([mctrlSatellites], ([$mctrlSatellitesStore]) =>
	($mctrlSatellitesStore ?? []).sort(sortSatellites)
);

export const mctrlSatellitesLoaded = derived(
	[satellitesUncertifiedStore],
	([$satellitesUncertifiedStore]) => $satellitesUncertifiedStore !== undefined
);

export const mctrlSatellitesNotLoaded = derived(
	[mctrlSatellitesLoaded],
	([$mctrlSatellitesLoaded]) => !$mctrlSatellitesLoaded
);
