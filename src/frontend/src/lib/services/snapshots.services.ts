import type { snapshot_id } from '$declarations/ic/ic.did';
import {
	canisterSnapshots,
	canisterStart,
	canisterStop,
	createSnapshot as createSnapshotApi
} from '$lib/api/ic.api';
import { i18n } from '$lib/stores/i18n.store';
import { snapshotStore } from '$lib/stores/snapshot.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { type CreateSnapshotProgress, CreateSnapshotProgressStep } from '$lib/types/snapshot';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

type CreateSnapshotOnProgress = (progress: CreateSnapshotProgress | undefined) => void;

interface CreateSnapshotParams {
	canisterId: Principal;
	snapshotId?: snapshot_id;
	identity: OptionIdentity;
	onProgress: CreateSnapshotOnProgress;
}

export const createSnapshot = async ({
	identity,
	...rest
}: CreateSnapshotParams): Promise<{ success: 'ok' | 'cancelled' | 'error'; err?: unknown }> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		await excecuteStepsToCreateSnapshot({
			identity,
			...rest
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

export const excecuteStepsToCreateSnapshot = async ({
	canisterId,
	identity,
	snapshotId,
	onProgress
}: Omit<CreateSnapshotParams, 'identity'> & {
	identity: Identity;
}) => {
	// 1. We stop the canister to prepare for the snapshot creation.
	const stop = async () => await canisterStop({ canisterId, identity });
	await execute({ fn: stop, onProgress, step: CreateSnapshotProgressStep.StoppingCanister });

	try {
		// 2. We create the backup / we take the snapshot
		const create = async () => takeSnapshot({ canisterId, snapshotId, identity });
		await execute({ fn: create, onProgress, step: CreateSnapshotProgressStep.CreatingSnapshot });
	} finally {
		// 3. We restart the canister to finalize the process. No matter what.
		const restart = async () => await canisterStart({ canisterId, identity });
		await execute({ fn: restart, onProgress, step: CreateSnapshotProgressStep.RestartingCanister });
	}
};

const takeSnapshot = async ({
	canisterId,
	...rest
}: Pick<CreateSnapshotParams, 'canisterId' | 'snapshotId'> & {
	identity: Identity;
}) => {
	const newSnapshotId = await createSnapshotApi({ canisterId, ...rest });

	// Currently the IC only supports once snapshot per canister.
	snapshotStore.set({
		canisterId: canisterId.toText(),
		data: [newSnapshotId]
	});
};

const execute = async ({
	fn,
	step,
	onProgress
}: {
	fn: () => Promise<void>;
	step: CreateSnapshotProgressStep;
	onProgress: CreateSnapshotOnProgress;
}) => {
	onProgress({
		step,
		state: 'in_progress'
	});

	try {
		await fn();

		onProgress({
			step,
			state: 'success'
		});
	} catch (err: unknown) {
		onProgress({
			step,
			state: 'error'
		});

		throw err;
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
