import { missionControlUserUncertifiedStore } from '$lib/stores/mission-control.store';
import { fromNullishNullable } from '$lib/utils/did.utils';
import { metadataEmail } from '$lib/utils/metadata.utils';
import { derived } from 'svelte/store';

export const missionControlUserData = derived(
	[missionControlUserUncertifiedStore],
	([$missionControlUserDataStore]) => $missionControlUserDataStore?.data
);

export const missionControlUserDataLoaded = derived(
	[missionControlUserUncertifiedStore],
	([$missionControlUserDataStore]) => $missionControlUserDataStore !== undefined
);

const missionControlConfig = derived([missionControlUserData], ([$missionControlUserData]) =>
	fromNullishNullable($missionControlUserData?.config)
);

export const missionControlConfigMonitoring = derived(
	[missionControlConfig],
	([$missionControlConfig]) => fromNullishNullable($missionControlConfig?.monitoring)
);

export const missionControlMetadata = derived(
	[missionControlUserData],
	([$missionControlUserData]) => $missionControlUserData?.metadata
);

export const missionControlEmail = derived([missionControlUserData], ([$missionControlUserData]) =>
	metadataEmail($missionControlUserData?.metadata ?? [])
);
