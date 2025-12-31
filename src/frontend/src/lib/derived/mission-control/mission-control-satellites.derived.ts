import { satellitesUncertifiedStore } from '$lib/stores/mission-control/satellites.store';
import { satelliteName } from '$lib/utils/satellite.utils';
import { derived } from 'svelte/store';

export const mctrlSatellitesStore = derived(
	[satellitesUncertifiedStore],
	([$satellitesDataStore]) => $satellitesDataStore?.data
);

export const mctrlSortedSatellites = derived([mctrlSatellitesStore], ([$mctrlSatellitesStore]) =>
	($mctrlSatellitesStore ?? []).sort((a, b) => satelliteName(a).localeCompare(satelliteName(b)))
);

export const mctrlSatellitesLoaded = derived(
	[satellitesUncertifiedStore],
	([$satellitesUncertifiedStore]) => $satellitesUncertifiedStore !== undefined
);

export const mctrlSatellitesNotLoaded = derived(
	[mctrlSatellitesLoaded],
	([$mctrlSatellitesLoaded]) => !$mctrlSatellitesLoaded
);
