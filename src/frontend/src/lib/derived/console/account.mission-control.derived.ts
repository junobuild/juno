import { accountCertifiedStore } from '$lib/stores/account.store';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const missionControlId = derived([accountCertifiedStore], ([$missionControlDataStore]) =>
	fromNullable($missionControlDataStore?.data.mission_control_id ?? [])
);

export const missionControlIdLoaded = derived(
	[accountCertifiedStore],
	([$missionControlIdCertifiedStore]) => $missionControlIdCertifiedStore !== undefined
);

export const missionControlIdNotLoaded = derived(
	[missionControlIdLoaded],
	([$missionControlIdLoaded]) => !$missionControlIdLoaded
);
