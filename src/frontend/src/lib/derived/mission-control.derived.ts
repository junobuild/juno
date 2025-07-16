import { missionControlIdCertifiedStore } from '$lib/stores/mission-control.store';
import { derived } from 'svelte/store';

// TODO: find a better name but, I don't want to use missionControlId because it would clashes with the properties called missionControlId
export const missionControlIdDerived = derived(
	[missionControlIdCertifiedStore],
	([$missionControlDataStore]) => $missionControlDataStore?.data
);

export const missionControlIdLoaded = derived(
	[missionControlIdCertifiedStore],
	([$missionControlIdCertifiedStore]) => $missionControlIdCertifiedStore !== undefined
);

export const missionControlIdNotLoaded = derived(
	[missionControlIdLoaded],
	([$missionControlIdLoaded]) => !$missionControlIdLoaded
);
