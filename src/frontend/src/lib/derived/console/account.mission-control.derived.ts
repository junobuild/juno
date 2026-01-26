import { accountCertifiedStore } from '$lib/stores/account.store';
import type { MissionControlCertifiedId, MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { fromNullable, isNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const missionControlCertifiedId = derived(
	[accountCertifiedStore],
	([$accountCertifiedStore]): MissionControlCertifiedId => {
		if (isNullish($accountCertifiedStore)) {
			return undefined;
		}

		const missionControlId =
			fromNullable($accountCertifiedStore.data?.mission_control_id ?? []) ?? null;

		return {
			data: missionControlId,
			certified: $accountCertifiedStore.certified
		};
	}
);

export const missionControlId = derived(
	[accountCertifiedStore],
	([$accountCertifiedStore]): Option<MissionControlId> => {
		if (isNullish($accountCertifiedStore)) {
			return undefined;
		}

		return fromNullable($accountCertifiedStore?.data?.mission_control_id ?? []) ?? null;
	}
);

export const missionControlIdLoaded = derived(
	[accountCertifiedStore],
	([$missionControlIdCertifiedStore]) => $missionControlIdCertifiedStore !== undefined
);

export const missionControlIdNotLoaded = derived(
	[missionControlIdLoaded],
	([$missionControlIdLoaded]) => !$missionControlIdLoaded
);
