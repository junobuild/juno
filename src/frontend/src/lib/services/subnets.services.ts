import { getSubnetId } from '$lib/api/ic.api';
import subnets from '$lib/env/subnets.json';
import {
	resetAllIdbStore,
	resetIdbStore,
	setIdbStore,
	syncIdbStore
} from '$lib/services/idb-store.services';
import { i18n } from '$lib/stores/i18n.store';
import { subnetsIdbStore } from '$lib/stores/idb.store';
import { subnetStore } from '$lib/stores/subnet.store';
import { toasts } from '$lib/stores/toasts.store';
import { nonNullish } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const syncSubnets = async () => {
	await syncIdbStore({
		customStore: subnetsIdbStore,
		store: subnetStore
	});
};

export const resetSubnets = async () => {
	await resetAllIdbStore({
		customStore: subnetsIdbStore,
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

		const subnet = nonNullish(subnetId)
			? subnets.find(({ subnetId: id }) => id === subnetId)
			: undefined;

		const data = nonNullish(subnetId)
			? {
					...(nonNullish(subnet) && subnet),
					subnetId
				}
			: undefined;

		await setIdbStore({
			store: subnetStore,
			customStore: subnetsIdbStore,
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
			customStore: subnetsIdbStore,
			canisterId: canisterIdText
		});

		return { success: false };
	}
};
