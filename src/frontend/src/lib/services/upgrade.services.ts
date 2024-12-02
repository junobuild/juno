import { downloadRelease, getReleasesMetadata } from '$lib/rest/cdn.rest';
import { loadSnapshots } from '$lib/services/snapshots.services';
import { wizardBusy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Wasm } from '$lib/types/upgrade';
import { sha256 } from '$lib/utils/crypto.utils';
import { emit } from '$lib/utils/events.utils';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import type { UpgradeCodeParams, UpgradeCodeProgress } from '@junobuild/admin';
import { compare } from 'semver';
import { get } from 'svelte/store';

export const newerReleases = async ({
	currentVersion,
	segments
}: {
	currentVersion: string;
	segments: 'mission_controls' | 'satellites' | 'orbiters';
}): Promise<{ result: string[] | undefined; error?: unknown }> => {
	try {
		const metadata = await getReleasesMetadata();

		return {
			result: metadata[segments].filter((version) => compare(currentVersion, version) === -1)
		};
	} catch (error: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.upgrade_load_versions,
			detail: error
		});

		return { result: undefined, error };
	}
};

export const downloadWasm = async (params: {
	segment: 'satellite' | 'mission_control' | 'orbiter';
	version: string;
}): Promise<Wasm> => {
	const wasm = await downloadRelease(params);
	const hash = await sha256(wasm);

	return {
		wasm,
		hash,
		version: params.version
	};
};

export interface UpgradeParams {
	onProgress: (progress: UpgradeCodeProgress | undefined) => void;
	wasm: Wasm | undefined;
	upgrade: ({
		wasmModule
	}: Pick<UpgradeCodeParams, 'wasmModule' | 'onProgress' | 'takeSnapshot'>) => Promise<void>;
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
	identity
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

		emit({ message: 'junoReloadVersions' });

		// Small delay to ensure junoReloadVersions is emitted
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
