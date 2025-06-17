import type { AssetNoContent } from '$declarations/satellite/satellite.did';
import { downloadWasm } from '$lib/rest/cdn.dev';
import { downloadRelease } from '$lib/rest/cdn.rest';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Wasm } from '$lib/types/upgrade';
import { sha256 } from '$lib/utils/crypto.utils';
import { container } from '$lib/utils/juno.utils';
import type { Principal } from '@dfinity/principal';
import { fromNullable } from '@dfinity/utils';
import { downloadUrl as downloadUrlLib } from '@junobuild/core';

export const downloadWasmFromJunoCdn = async (params: {
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

export const downloadWasmFromDevCdn = async ({
	asset: {
		key: { full_path, token }
	},
	satelliteId,
	identity
}: {
	asset: AssetNoContent;
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<Omit<Wasm, 'version'>> => {
	const downloadUrl = downloadUrlLib({
		assetKey: { fullPath: full_path, token: fromNullable(token) },
		satellite: {
			satelliteId: satelliteId.toText(),
			identity: identity ?? undefined,
			...container()
		}
	});

	const wasm = await downloadWasm({ downloadUrl });
	const hash = await sha256(wasm);

	return {
		wasm,
		hash
	};
};
