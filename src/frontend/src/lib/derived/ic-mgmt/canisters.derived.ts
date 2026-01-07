import { canistersSyncDataStore } from '$lib/stores/ic-mgmt/canister-sync-data.store';
import { derived } from 'svelte/store';

export const canistersSyncDataSynced = derived(
	[canistersSyncDataStore],
	([$canistersSyncDataStore]) =>
		Object.values($canistersSyncDataStore ?? {}).find(
			(canister) => !['synced', 'error'].includes(canister?.data.sync ?? 'loading')
		) === undefined
);

export const canistersSyncDataNotSynced = derived(
	[canistersSyncDataSynced],
	([$canistersSyncDataSynced]) => !$canistersSyncDataSynced
);

export const canistersSyncDataCount = derived(
	[canistersSyncDataStore],
	([$canistersSyncDataStore]) => Object.values($canistersSyncDataStore ?? {}).length
);
