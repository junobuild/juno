import type { CertifiedCanisterStore } from '$lib/stores/_certified-canister.store';
import type { CanisterIdText } from '$lib/types/canister';
import type { CertifiedData } from '$lib/types/store';
import { entries as idbEntries, set, type UseStore } from 'idb-keyval';

// We consider any data saved in IDB as not being certified. That's why we save those without any certified flags
// but always read those with certified: false

export const syncUncertifiedIdbStore = async <T>({
	customStore,
	store
}: {
	customStore: UseStore;
	store: CertifiedCanisterStore<T>;
}) => {
	const entries = await idbEntries<CanisterIdText, T>(customStore);

	store.setAll(
		entries.length === 0
			? undefined
			: entries.reduce(
					(acc, [key, data]) => ({
						...acc,
						[key]: {
							data,
							certified: undefined
						}
					}),
					{}
				)
	);
};

export const setUncertifiedIdbStore = async <T>({
	customStore,
	store,
	canisterId,
	data: certifiedData
}: {
	customStore: UseStore;
	store: CertifiedCanisterStore<T>;
	canisterId: CanisterIdText;
	data: CertifiedData<T>;
}) => {
	const { data, certified } = certifiedData;

	store.set({
		canisterId,
		data: { data, certified }
	});

	await set(canisterId, data, customStore);
};
