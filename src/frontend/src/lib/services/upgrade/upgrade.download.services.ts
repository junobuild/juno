import { downloadWasm } from '$lib/rest/cdn.dev';
import { downloadRelease } from '$lib/rest/cdn.rest';
import type { Wasm } from '$lib/types/upgrade';
import { sha256 } from '$lib/utils/crypto.utils';
import type { Asset } from '@junobuild/storage';

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
	asset: { downloadUrl }
}: {
	asset: Asset;
}): Promise<Omit<Wasm, 'version'>> => {
	const wasm = await downloadWasm({ downloadUrl });
	const hash = await sha256(wasm);

	return {
		wasm,
		hash
	};
};
