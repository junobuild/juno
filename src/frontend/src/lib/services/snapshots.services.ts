import type { snapshot_id } from '$declarations/ic/ic.did';
import { canisterSnapshots, createSnapshot as createSnapshotApi } from '$lib/api/ic.api';
import { i18n } from '$lib/stores/i18n.store';
import { snapshotStore } from '$lib/stores/snapshot.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const createSnapshot = async ({
    canisterId,
    snapshotId,
	identity,
}: {
	canisterId: Principal;
	snapshotId?: snapshot_id;
	identity: OptionIdentity;
}): Promise<{ success: 'ok' | 'cancelled' | 'error'; err?: unknown }> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const newSnapshotId = await createSnapshotApi({ canisterId, snapshotId, identity });

        // Currently the IC only supports once snapshot per canister.
        snapshotStore.set({
            canisterId: canisterId.toText(),
            data: [newSnapshotId]
        });
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.snapshot_create_error,
			detail: err
		});

		return { success: 'error', err };
	}

	return { success: 'ok' };
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
