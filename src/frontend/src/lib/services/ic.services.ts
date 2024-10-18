import { getSubnetId } from '$lib/api/ic.api';
import { i18n } from '$lib/stores/i18n.store';
import { subnetsStore } from '$lib/stores/subnets.store';
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
		const store = get(subnetsStore);
		if (nonNullish(store[canisterIdText]) && !reload) {
			return { success: true };
		}

		const subnetId = await getSubnetId({
			canisterId: canisterId.toText()
		});

		subnetsStore.setSubnets({
			canisterId: canisterIdText,
			subnet: nonNullish(subnetId) ? { subnetId } : undefined
		});

		return { success: true };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.hosting_loading_errors,
			detail: err
		});

		subnetsStore.setSubnets({
			canisterId: canisterIdText,
			subnet: null
		});

		return { success: false };
	}
};
