import { account } from '$lib/derived/console/account.derived';
import { accountCertifiedStore } from '$lib/stores/account.store';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const missionControlId = derived([account], ([$account]) =>
	fromNullable($account?.mission_control_id ?? [])
);

export const missionControlIdLoaded = derived(
	[accountCertifiedStore],
	([$missionControlIdCertifiedStore]) => $missionControlIdCertifiedStore !== undefined
);

export const missionControlIdNotLoaded = derived(
	[missionControlIdLoaded],
	([$missionControlIdLoaded]) => !$missionControlIdLoaded
);
