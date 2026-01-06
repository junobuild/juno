import type { MissionControlDid } from '$declarations';
import { orbiterStore } from '$lib/derived/orbiter.derived';
import { canistersSyncDataStore } from '$lib/stores/ic-mgmt/canister-sync-data.store';
import type { SegmentWithSyncData } from '$lib/types/segment';
import { isNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const orbiterWithSyncData = derived(
	[orbiterStore, canistersSyncDataStore],
	([$orbiterStore, $canistersSyncDataStore]) => {
		if (isNullish($orbiterStore)) {
			return undefined;
		}

		const { orbiter_id, ...rest } = $orbiterStore;

		const canister = $canistersSyncDataStore?.[orbiter_id.toText()]?.data;

		if (isNullish(canister)) {
			return undefined;
		}

		return <SegmentWithSyncData<MissionControlDid.Orbiter>>{
			segment: { orbiter_id, ...rest },
			canister
		};
	}
);
