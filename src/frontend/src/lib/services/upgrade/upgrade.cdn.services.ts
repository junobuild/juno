import { downloadWasmFromDevCdn } from '$lib/services/upgrade/upgrade.download.services';
import type { Wasm } from '$lib/types/upgrade';
import { mapJunoPackageMetadata } from '$lib/utils/version.utils';
import { readWasmMetadata } from '$lib/utils/wasm.utils';
import { isNullish } from '@dfinity/utils';
import type { Asset } from '@junobuild/storage';

export const prepareWasmUpgrade = async ({
	asset
}: {
	asset: Asset;
}): Promise<{ result: 'success'; wasm: Wasm } | { result: 'error'; err?: unknown }> => {
	const result = await downloadWasmFromDevCdn({ asset });

	const { wasm, ...rest } = result;

	const { junoPackage } = await readWasmMetadata({ wasm });

	if (isNullish(junoPackage)) {
		// TODO
		return { result: 'error' };
	}

	const metadata = mapJunoPackageMetadata({ pkg: junoPackage });

	if (isNullish(metadata)) {
		// TODO
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
