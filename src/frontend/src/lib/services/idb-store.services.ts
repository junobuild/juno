import type { CanisterStore } from '$lib/stores/_canister.store';
import type { CanisterIdText } from '$lib/types/canister';
import { clear, del, entries as idbEntries, set, type UseStore } from 'idb-keyval';

export const syncIdbStore = async <T>({
	customStore,
	store
}: {
	customStore: UseStore;
	store: CanisterStore<T>;
}) => {
	const entries = await idbEntries<CanisterIdText, T>(customStore);

	store.setAll(
		entries.length === 0
			? undefined
			: entries.reduce(
					(acc, [key, value]) => ({
						...acc,
						[key]: value
					}),
					{}
				)
	);
};

export const setIdbStore = async <T>({
	customStore,
	store,
	canisterId,
	data
}: {
	customStore: UseStore;
	store: CanisterStore<T>;
	canisterId: CanisterIdText;
	data: T;
}) => {
	store.set({
		canisterId,
		data
	});

	await set(canisterId, data, customStore);
};

export const resetIdbStore = async <T>({
	customStore,
	store,
	canisterId
}: {
	customStore: UseStore;
	store: CanisterStore<T>;
	canisterId: CanisterIdText;
}) => {
	store.reset(canisterId);

	await del(canisterId, customStore);
};

export const resetAllIdbStore = async <T>({
	customStore,
	store
}: {
	customStore: UseStore;
	store: CanisterStore<T>;
}) => {
	store.resetAll();

	await clear(customStore);
};
