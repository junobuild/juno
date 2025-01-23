import { initBulkCanistersStore, initPerCanisterStore } from '$lib/stores/_canister.store';
import type { CanisterSyncMonitoring } from '$lib/types/canister';
import type { CertifiedData } from '$lib/types/store';

export type UncertifiedCanisterSyncMonitoring = CertifiedData<CanisterSyncMonitoring>;

// TODO: Uncertified because memory is not yet called with an update
export const canisterMonitoringUncertifiedStore =
	initPerCanisterStore<UncertifiedCanisterSyncMonitoring>();

// TODO: Uncertified because memory is not yet called with an update
export const canistersMonitoringUncertifiedStore =
	initBulkCanistersStore<UncertifiedCanisterSyncMonitoring>();
