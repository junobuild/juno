import { missionControlSettingsUncertifiedStore } from '$lib/stores/mission-control.store';
import { fromNullishNullable, nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const missionControlSettings = derived(
	[missionControlSettingsUncertifiedStore],
	([$missionControlSettingsDataStore]) => $missionControlSettingsDataStore?.data
);

export const missionControlSettingsLoaded = derived(
	[missionControlSettingsUncertifiedStore],
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
	([$missionControlSettings]) => fromNullishNullable($missionControlSettings?.monitoring)
);

export const missionControlMonitored = derived(
	[missionControlMonitoring],
	([$missionControlMonitoring]) =>
		fromNullishNullable($missionControlMonitoring?.cycles)?.enabled === true
);

export const missionControlNotMonitored = derived(
	[missionControlMonitored],
	([$missionControlMonitored]) => !$missionControlMonitored
);
