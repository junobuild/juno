import type { MissionControlDid } from '$declarations';
import { orbiterStore } from '$lib/derived/orbiter.derived';
import { canistersSyncDataUncertifiedStore } from '$lib/stores/canister-sync-data.store';
import type { SegmentWithSyncData } from '$lib/types/satellite';
import { isNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const orbiterWithSyncData = derived(
	[orbiterStore, canistersSyncDataUncertifiedStore],
	([$orbiterStore, $canisterSyncDataUncertifiedStore]) => {
		if (isNullish($orbiterStore)) {
			return undefined;
		}

		const { orbiter_id, ...rest } = $orbiterStore;

		const canister = $canisterSyncDataUncertifiedStore?.[orbiter_id.toText()]?.data;

		if (isNullish(canister)) {
			return undefined;
		}

		return <SegmentWithSyncData<MissionControlDid.Orbiter>>{
			segment: { orbiter_id, ...rest },
			canister
		};
	}
);
