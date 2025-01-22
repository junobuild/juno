import { initCanisterDataStore } from '$lib/stores/_canister-data.store';
import type { CanisterSyncData } from '$lib/types/canister';
import type { CertifiedData } from '$lib/types/store';

// TODO: Uncertified because memory is not yet called with an update
export const canisterSyncDataUncertifiedStore =
	initCanisterDataStore<CertifiedData<CanisterSyncData>>();
