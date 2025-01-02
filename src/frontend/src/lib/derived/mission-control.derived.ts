import {
	missionControlDataStore,
	missionControlSettingsDataStore
} from '$lib/stores/mission-control.store';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const missionControl = derived(
	[missionControlDataStore],
	([$missionControlDataStore]) => $missionControlDataStore?.data
);

// TODO: find a better name but, I don't want to use missionControlId because it would clashes with the properties called missionControlId
export const missionControlIdDerived = derived([missionControl], ([$missionControl]) =>
	fromNullable($missionControl?.mission_control_id ?? [])
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

export const missionControlMonitoring = derived(
	[missionControlSettings],
	([$missionControlSettings]) => fromNullable($missionControlSettings?.monitoring ?? [])
);

export const missionControlMonitored = derived(
	[missionControlMonitoring],
	([$missionControlMonitoring]) =>
		fromNullable($missionControlMonitoring?.cycles ?? [])?.enabled === true
);
