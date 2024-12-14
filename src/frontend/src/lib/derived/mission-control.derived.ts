import {
	missionControlDataStore,
	missionControlSettingsDataStore
} from '$lib/stores/mission-control.store';
import { derived } from 'svelte/store';

// TODO: rename store to shorten but find a good naming idea that does not conflicts with local variable
export const missionControlStore = derived(
	[missionControlDataStore],
	([$missionControlDataStore]) => $missionControlDataStore?.data
);

export const missionControlSettings = derived(
	[missionControlSettingsDataStore],
	([$missionControlSettingsDataStore]) => $missionControlSettingsDataStore?.data
);

export const missionControlSettingsLoaded = derived(
	[missionControlSettingsDataStore],
	([$missionControlSettingsDataStore]) => $missionControlSettingsDataStore !== undefined
);

export const missionControlSettingsNotLoaded = derived(
	[missionControlSettingsLoaded],
	([$missionControlSettingsLoaded]) => !$missionControlSettingsLoaded
);
