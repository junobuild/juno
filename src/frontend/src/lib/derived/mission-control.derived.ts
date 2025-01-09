import {
	missionControlIdDataStore,
	missionControlUserDataStore
} from '$lib/stores/mission-control.store';
import { metadataEmail } from '$lib/utils/metadata.utils';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

// TODO: find a better name but, I don't want to use missionControlId because it would clashes with the properties called missionControlId
export const missionControlIdDerived = derived(
	[missionControlIdDataStore],
	([$missionControlDataStore]) => $missionControlDataStore?.data
);

export const missionControlUserData = derived(
	[missionControlUserDataStore],
	([$missionControlUserDataStore]) => $missionControlUserDataStore?.data
);

export const missionControlConfig = derived([missionControlUserData], ([$missionControlUserData]) =>
	fromNullable($missionControlUserData?.config ?? [])
);

export const missionControlConfigMonitoring = derived(
	[missionControlConfig],
	([$missionControlConfig]) => fromNullable($missionControlConfig?.monitoring ?? [])
);

export const missionControlUserDataLoaded = derived(
	[missionControlUserDataStore],
	([$missionControlUserDataStore]) => $missionControlUserDataStore !== undefined
);

export const missionControlMetadata = derived(
	[missionControlUserData],
	([$missionControlUserData]) => $missionControlUserData?.metadata
);

export const missionControlEmail = derived([missionControlUserData], ([$missionControlUserData]) =>
	metadataEmail($missionControlUserData?.metadata ?? [])
);
