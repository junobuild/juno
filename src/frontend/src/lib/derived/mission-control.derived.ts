import { missionControlCertifiedStore } from '$lib/stores/mission-control.store';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

// TODO: find a better name but, I don't want to use missionControlId because it would clashes with the properties called missionControlId
export const missionControlIdDerived = derived(
	[missionControlCertifiedStore],
	([$missionControlDataStore]) =>
		fromNullable($missionControlDataStore?.data.mission_control_id ?? [])
);

export const missionControlIdLoaded = derived(
	[missionControlCertifiedStore],
	([$missionControlIdCertifiedStore]) => $missionControlIdCertifiedStore !== undefined
);

export const missionControlIdNotLoaded = derived(
	[missionControlIdLoaded],
	([$missionControlIdLoaded]) => !$missionControlIdLoaded
);
