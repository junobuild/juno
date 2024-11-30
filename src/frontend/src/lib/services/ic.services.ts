import { getSubnetId } from '$lib/api/ic.api';
import { i18n } from '$lib/stores/i18n.store';
import { subnetStore } from '$lib/stores/subnet.store';
import { toasts } from '$lib/stores/toasts.store';
import type { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

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

		subnetStore.set({
			canisterId: canisterIdText,
			data: nonNullish(subnetId) ? { subnetId } : undefined
		});

		return { success: true };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.subnet_loading_errors,
			detail: err
		});

		subnetStore.reset(canisterIdText);

		return { success: false };
	}
};
