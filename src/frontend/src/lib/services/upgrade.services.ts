import { downloadRelease, getReleasesMetadata } from '$lib/rest/cdn.rest';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { Wasm } from '$lib/types/upgrade';
import { sha256 } from '$lib/utils/crypto.utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

export const newerReleases = async ({
	currentVersion,
	segments
}: {
	currentVersion: string;
	segments: 'mission_controls' | 'satellites';
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
	segment: 'satellite' | 'mission_control';
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
