import { initBulkCanistersStore, initPerCanisterStore } from '$lib/stores/_canister.store';
import type { CanisterSyncData } from '$lib/types/canister';
import type { CertifiedData } from '$lib/types/store';

export type UncertifiedCanisterSyncData = CertifiedData<CanisterSyncData>;

// TODO: Uncertified because memory is not yet called with an update
export const canisterSyncDataUncertifiedStore = initPerCanisterStore<UncertifiedCanisterSyncData>();

// TODO: Uncertified because memory is not yet called with an update
export const canistersSyncDataUncertifiedStore =
	initBulkCanistersStore<UncertifiedCanisterSyncData>();
