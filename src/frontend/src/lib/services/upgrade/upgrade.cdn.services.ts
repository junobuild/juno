import { downloadWasmFromDevCdn } from '$lib/services/upgrade/upgrade.download.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { Wasm } from '$lib/types/upgrade';
import { mapJunoPackageMetadata } from '$lib/utils/version.utils';
import { readWasmMetadata } from '$lib/utils/wasm.utils';
import { isNullish } from '@dfinity/utils';
import type { Asset } from '@junobuild/storage';
import { get } from 'svelte/store';

export const prepareWasmUpgrade = async ({
	asset
}: {
	asset: Asset;
}): Promise<{ result: 'success'; wasm: Wasm } | { result: 'error'; err?: unknown }> => {
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

	return {
		result: 'success',
		wasm: {
			...rest,
			wasm,
			version: metadata.current,
			developerVersion: junoPackage.version
		}
	};
};
