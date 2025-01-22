import { canisterSyncDataUncertifiedStore } from '$lib/stores/canister-sync-data.store';
import { derived } from 'svelte/store';

export const canisterSyncDataStore = derived(
	[canisterSyncDataUncertifiedStore],
	([$canisterSyncDataUncertifiedStore]) => $canisterSyncDataUncertifiedStore
);
