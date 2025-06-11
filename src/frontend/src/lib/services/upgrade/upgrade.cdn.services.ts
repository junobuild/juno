import { instantSatelliteVersion } from '$lib/services/feature.services';
import { downloadWasmFromDevCdn } from '$lib/services/upgrade/upgrade.download.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { Wasm } from '$lib/types/upgrade';
import { mapJunoPackageMetadata } from '$lib/utils/version.utils';
import { readWasmMetadata } from '$lib/utils/wasm.utils';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import type { Asset } from '@junobuild/storage';
import { compare } from 'semver';
import { get } from 'svelte/store';

export const prepareWasmUpgrade = async ({
	asset,
	satelliteId
}: {
	asset: Asset;
	satelliteId: Principal;
}): Promise<{ result: 'success'; wasm: Wasm } | { result: 'error'; err?: unknown }> => {
	try {
		const result = await downloadWasmFromDevCdn({ asset });

		const { wasm, ...rest } = result;

		const { junoPackage } = await readWasmMetadata({ wasm });

		if (isNullish(junoPackage)) {
			toasts.error({
				text: get(i18n).errors.missing_juno_package
			});

			return { result: 'error' };
		}

		const metadata = mapJunoPackageMetadata({ pkg: junoPackage });

		if (isNullish(metadata)) {
			toasts.error({
				text: get(i18n).errors.invalid_juno_package
			});

			return { result: 'error' };
		}

		const currentVersion = instantSatelliteVersion({ satelliteId });

		if (isNullish(currentVersion)) {
			toasts.error({
				text: get(i18n).errors.missing_satellite_version
			});

			return { result: 'error' };
		}

		if (compare(currentVersion, metadata.current) > 0) {
			toasts.error({
				text: get(i18n).errors.invalid_version_cannot_downgrade
			});

			return { result: 'error' };
		}

		return {
			result: 'success',
			wasm: {
				...rest,
				wasm,
				version: metadata.current,
				developerVersion: junoPackage.version
			}
		};
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.upgrade_download_error,
			detail: err
		});

		return { result: 'error', err };
	}
};
