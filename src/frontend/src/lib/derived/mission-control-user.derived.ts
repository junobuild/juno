import { missionControlUserDataStore } from '$lib/stores/mission-control.store';
import { metadataEmail } from '$lib/utils/metadata.utils';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const missionControlUserData = derived(
	[missionControlUserDataStore],
	([$missionControlUserDataStore]) => $missionControlUserDataStore?.data
);

export const missionControlUserDataLoaded = derived(
	[missionControlUserDataStore],
	([$missionControlUserDataStore]) => $missionControlUserDataStore !== undefined
);

const missionControlConfig = derived([missionControlUserData], ([$missionControlUserData]) =>
	fromNullable($missionControlUserData?.config ?? [])
);

export const missionControlConfigMonitoring = derived(
	[missionControlConfig],
	([$missionControlConfig]) => fromNullable($missionControlConfig?.monitoring ?? [])
);

export const missionControlMetadata = derived(
	[missionControlUserData],
	([$missionControlUserData]) => $missionControlUserData?.metadata
);

export const missionControlEmail = derived([missionControlUserData], ([$missionControlUserData]) =>
	metadataEmail($missionControlUserData?.metadata ?? [])
);
