import { canistersSyncDataUncertifiedStore } from '$lib/stores/canister-sync-data.store';
import { derived } from 'svelte/store';

export const canistersSyncDataUncertifiedSynced = derived(
	[canistersSyncDataUncertifiedStore],
	([$canistersSyncDataUncertifiedStore]) =>
		Object.values($canistersSyncDataUncertifiedStore ?? {}).find(
			(canister) => !['synced', 'error'].includes(canister?.data.sync ?? 'loading')
		) === undefined
);

export const canistersSyncDataUncertifiedNotSynced = derived(
	[canistersSyncDataUncertifiedSynced],
	([$canistersSyncDataUncertifiedSynced]) => !$canistersSyncDataUncertifiedSynced
);

export const canistersSyncDataUncertifiedCount = derived(
	[canistersSyncDataUncertifiedStore],
	([$canistersSyncDataUncertifiedStore]) =>
		Object.values($canistersSyncDataUncertifiedStore ?? {}).length
);
