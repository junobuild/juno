import { canisterSnapshots, getSubnetId } from '$lib/api/ic.api';
import { i18n } from '$lib/stores/i18n.store';
import { snapshotStore } from '$lib/stores/snapshot.store';
import { subnetStore } from '$lib/stores/subnet.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, nonNullish } from '@dfinity/utils';
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

export const loadSnapshots = async ({
	canisterId,
	identity,
	reload = false
}: {
	canisterId: Principal;
	identity: OptionIdentity;
	reload?: boolean;
}): Promise<{ success: boolean }> => {
	const canisterIdText = canisterId.toText();

	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const store = get(snapshotStore);

		if (nonNullish(store?.[canisterIdText]) && !reload) {
			return { success: true };
		}

		const snapshots = await canisterSnapshots({
			canisterId,
			identity
		});

		snapshotStore.set({
			canisterId: canisterIdText,
			data: snapshots
		});

		return { success: true };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.snapshot_loading_errors,
			detail: err
		});

		snapshotStore.reset(canisterIdText);

		return { success: false };
	}
};
