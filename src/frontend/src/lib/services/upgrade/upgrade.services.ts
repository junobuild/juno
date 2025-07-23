import { loadSnapshots } from '$lib/services/snapshots.services';
import { wizardBusy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Wasm } from '$lib/types/upgrade';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import type { UpgradeCodeParams, UpgradeCodeProgress } from '@junobuild/admin';
import { get } from 'svelte/store';

export interface UpgradeParams {
	onProgress: (progress: UpgradeCodeProgress | undefined) => void;
	wasm: Wasm | undefined;
	upgrade: ({
		wasmModule
	}: Pick<UpgradeCodeParams, 'wasmModule' | 'onProgress' | 'takeSnapshot'>) => Promise<void>;
	reloadVersion: () => Promise<void>;
	nextSteps: (
		steps: 'init' | 'confirm' | 'download' | 'review' | 'in_progress' | 'ready' | 'error'
	) => void;
	takeSnapshot: boolean;
	canisterId: Principal;
	identity: OptionIdentity;
}

export const upgrade = async ({
	onProgress,
	wasm,
	upgrade,
	nextSteps,
	takeSnapshot,
	canisterId,
	identity,
	reloadVersion
}: UpgradeParams) => {
	onProgress(undefined);

	if (isNullish(wasm)) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.upgrade_no_wasm
		});

		nextSteps('error');

		return;
	}

	wizardBusy.start();

	nextSteps('in_progress');

	try {
		const wasmModule = new Uint8Array(await wasm.wasm.arrayBuffer());

		await upgrade({ wasmModule, takeSnapshot, onProgress });

		if (takeSnapshot) {
			await loadSnapshots({
				canisterId,
				identity,
				reload: true
			});
		}

		await reloadVersion();

		// Small delay for UI cosmetic reasons
		setTimeout(() => {
			nextSteps('ready');

			wizardBusy.stop();
		}, 500);
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.upgrade_error,
			detail: err
		});

		nextSteps('error');

		wizardBusy.stop();
	}
};
