import type { CanisterStore } from '$lib/stores/canister.store';
import { snapshotStore } from '$lib/stores/snapshot.store';
import { subnetStore } from '$lib/stores/subnet.store';
import type { CanisterIdText } from '$lib/types/canister';
import { nonNullish } from '@dfinity/utils';
import { createStore, entries as idbEntries, set, type UseStore } from 'idb-keyval';

const customSubnetStore = createStore('juno-subnet', 'juno-subnet-store');
const customSnapshotStore = createStore('juno-snapshot', 'juno-snapshot-store');

export const syncCanisterStores = async () => {
	await Promise.all([
		syncStore({
			customStore: customSubnetStore,
			store: subnetStore
		}),
		syncStore({
			customStore: customSnapshotStore,
			store: snapshotStore
		})
	]);
};

const syncStore = async <T>({
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

export const setSubnet = async ({
	canisterId,
	subnetId
}: {
	canisterId: CanisterIdText;
	subnetId: string | undefined;
}) => {
	const data = nonNullish(subnetId) ? { subnetId } : undefined;

	subnetStore.set({
		canisterId,
		data
	});

	await set(canisterId, data, customSubnetStore);
};
