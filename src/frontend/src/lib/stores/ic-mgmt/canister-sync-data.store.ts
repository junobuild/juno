import {
	initBulkCertifiedCanistersStore,
	initPerCertifiedCanisterStore
} from '$lib/stores/_certified-canister.store';
import type { CanisterSyncData } from '$lib/types/canister';

export const canisterSyncDataStore = initPerCertifiedCanisterStore<CanisterSyncData>();

export const canistersSyncDataStore = initBulkCertifiedCanistersStore<CanisterSyncData>();
