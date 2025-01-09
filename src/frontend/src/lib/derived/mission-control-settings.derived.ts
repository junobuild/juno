import { missionControlSettingsDataStore } from '$lib/stores/mission-control.store';
import { fromNullable, nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

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

export const hasMissionControlSettings = derived(
	[missionControlSettings],
	([$missionControlSettings]) => nonNullish($missionControlSettings)
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

export const missionControlNotMonitored = derived(
	[missionControlMonitored],
	([$missionControlMonitored]) => !$missionControlMonitored
);
