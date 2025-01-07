import {
	missionControlIdDataStore,
	missionControlMetadataDataStore,
	missionControlSettingsDataStore
} from '$lib/stores/mission-control.store';
import { metadataEmail } from '$lib/utils/metadata.utils';
import { fromNullable, nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

// TODO: find a better name but, I don't want to use missionControlId because it would clashes with the properties called missionControlId
export const missionControlIdDerived = derived(
	[missionControlIdDataStore],
	([$missionControlDataStore]) => $missionControlDataStore?.data
);

export const missionControlSettings = derived(
	[missionControlSettingsDataStore],
	([$missionControlSettingsDataStore]) => $missionControlSettingsDataStore?.data
);

export const hasMissionControlSettings = derived(
	[missionControlSettings],
	([$missionControlSettings]) => nonNullish($missionControlSettings)
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

export const missionControlMonitoringConfig = derived(
	[missionControlSettings],
	([$missionControlSettings]) => fromNullable($missionControlSettings?.monitoring_config ?? [])
);

export const missionControlMonitored = derived(
	[missionControlMonitoring],
	([$missionControlMonitoring]) =>
		fromNullable($missionControlMonitoring?.cycles ?? [])?.enabled === true
);

export const missionControlMetadataLoaded = derived(
	[missionControlMetadataDataStore],
	([$missionControlMetadataDataStore]) => $missionControlMetadataDataStore !== undefined
);

export const missionControlMetadata = derived(
	[missionControlMetadataDataStore],
	([$missionControlMetadataDataStore]) => $missionControlMetadataDataStore?.data
);

export const missionControlEmail = derived(
	[missionControlMetadataDataStore],
	([$missionControlMetadataDataStore]) =>
		metadataEmail($missionControlMetadataDataStore?.data ?? [])
);
