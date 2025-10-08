import { instantSatelliteVersion } from '$lib/services/feature.services';
import { downloadWasmFromDevCdn } from '$lib/services/upgrade/upgrade.download.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { SatelliteDid } from '$lib/types/declarations';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Wasm } from '$lib/types/upgrade';
import { i18nFormat } from '$lib/utils/i18n.utils';
import { mapJunoPackageMetadata } from '$lib/utils/version.utils';
import { readWasmMetadata } from '$lib/utils/wasm.utils';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import { checkUpgradeVersion } from '@junobuild/admin';
import { compare } from 'semver';
import { get } from 'svelte/store';

export const prepareWasmUpgrade = async ({
	asset,
	satelliteId,
	identity
}: {
	asset: SatelliteDid.AssetNoContent;
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<{ result: 'success'; wasm: Wasm } | { result: 'error'; err?: unknown }> => {
	try {
		const result = await downloadWasmFromDevCdn({ asset, satelliteId, identity });

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

		const { current: selectedVersion } = metadata;

		const isDowngrade = compare(selectedVersion, currentVersion) < 0;
		if (isDowngrade) {
			toasts.error({
				text: get(i18n).errors.invalid_version_cannot_downgrade
			});

			return { result: 'error' };
		}

		const { canUpgrade } = checkUpgradeVersion({ currentVersion, selectedVersion });
		if (!canUpgrade) {
			toasts.error({
				text: i18nFormat(get(i18n).errors.upgrade_requires_iterative_version, [
					{
						placeholder: '{0}',
						value: get(i18n).satellites.satellite
					},
					{
						placeholder: '{1}',
						value: currentVersion
					},
					{
						placeholder: '{2}',
						value: selectedVersion
					}
				])
			});
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
