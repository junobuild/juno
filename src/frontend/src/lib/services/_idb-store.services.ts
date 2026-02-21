import type { CanisterStore } from '$lib/stores/_canister.store';
import type { CertifiedCanisterStore } from '$lib/stores/_certified-canister.store';
import type { CanisterIdText } from '$lib/types/canister';
import { clear, del, type UseStore } from 'idb-keyval';

export const resetIdbStore = async <T>({
	customStore,
	store,
	canisterId
}: {
	customStore: UseStore;
	store: CanisterStore<T> | CertifiedCanisterStore<T>;
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
	store: CanisterStore<T> | CertifiedCanisterStore<T>;
}) => {
	store.resetAll();

	await clear(customStore);
};
