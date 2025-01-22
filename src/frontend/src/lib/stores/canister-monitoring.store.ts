import { initCanisterStore } from '$lib/stores/_canister.store';
import type { CanisterSyncMonitoring } from '$lib/types/canister';
import type { CertifiedData } from '$lib/types/store';

// TODO: Uncertified because memory is not yet called with an update
export const canisterMonitoringUncertifiedStore =
	initCanisterStore<CertifiedData<CanisterSyncMonitoring>>();
