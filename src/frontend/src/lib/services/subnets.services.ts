import { getSubnetId } from '$lib/api/ic.api';
import {
	resetAllIdbStore,
	resetIdbStore,
	setIdbStore,
	syncIdbStore
} from '$lib/services/idb-store.services';
import { i18n } from '$lib/stores/i18n.store';
import { subnetStore } from '$lib/stores/subnet.store';
import { toasts } from '$lib/stores/toasts.store';
import type { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';
import { createStore } from 'idb-keyval';
import { get } from 'svelte/store';

const customSubnetStore = createStore('juno-subnet', 'juno-subnet-store');

export const syncSubnets = async () => {
	await syncIdbStore({
		customStore: customSubnetStore,
		store: subnetStore
	});
};

export const resetSubnets = async () => {
	await resetAllIdbStore({
		customStore: customSubnetStore,
		store: subnetStore
	});
};

export const loadSubnetId = async ({
	canisterId,
	reload = false
}: {
	canisterId: Principal;
	reload?: boolean;
}): Promise<{ success: boolean }> => {
	const canisterIdText = canisterId.toText();

	try {
		const store = get(subnetStore);

		if (nonNullish(store?.[canisterIdText]) && !reload) {
			return { success: true };
		}

		const subnetId = await getSubnetId({
			canisterId: canisterId.toText()
		});

		const data = nonNullish(subnetId) ? { subnetId } : undefined;

		await setIdbStore({
			store: subnetStore,
			customStore: customSubnetStore,
			canisterId: canisterIdText,
			data
		});

		return { success: true };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.subnet_loading_errors,
			detail: err
		});

		await resetIdbStore({
			store: subnetStore,
			customStore: customSubnetStore,
			canisterId: canisterIdText
		});

		return { success: false };
	}
};
