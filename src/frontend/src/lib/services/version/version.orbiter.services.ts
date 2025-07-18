import { getNewestReleasesMetadata } from '$lib/rest/cdn.rest';
import { getOrbiterVersionMetadata } from '$lib/services/version/version.metadata.orbiter.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { versionStore } from '$lib/stores/version.store';
import type { LoadVersionBaseParams, LoadVersionResult } from '$lib/types/version';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const reloadOrbiterVersion = async ({
	orbiterId,
	toastError = true,
	...rest
}: {
	// Optional for convenience reason
	orbiterId?: Principal;
} & LoadVersionBaseParams): Promise<LoadVersionResult> => {
	const result = await loadOrbiterVersion({
		orbiterId,
		...rest
	});

	if (result.result === 'error' && toastError) {
		toasts.error({
			text: get(i18n).errors.load_version,
			detail: result.err
		});
	}

	return result;
};

const loadOrbiterVersion = async ({
	orbiterId,
	identity,
	skipReload
}: {
	orbiterId?: Principal;
} & Omit<LoadVersionBaseParams, 'toastError'>): Promise<LoadVersionResult> => {
	// Optional for convenience reasons.
	if (isNullish(orbiterId)) {
		return { result: 'skipped' };
	}

	// We load the orbiter version once per session or when explicitly needed
	const store = get(versionStore);
	if (nonNullish(store.orbiter) && skipReload) {
		return { result: 'skipped' };
	}

	try {
		// Optional for convenience reasons. A guard prevent the usage of the service while not being sign-in.
		assertNonNullish(identity);

		const [metadata, releases] = await Promise.all([
			getOrbiterVersionMetadata({ orbiterId, identity }),
			// TODO: we can probably improve - reduce the number of queries on the CDN - by caching in store the releases metadata
			// instead of re-querying those every time separately.
			getNewestReleasesMetadata()
		]);

		const { metadata: orbVersion } = metadata;

		versionStore.setOrbiter({
			release: releases.orbiter,
			...orbVersion
		});

		return { result: 'loaded' };
	} catch (err: unknown) {
		versionStore.setOrbiter(null);

		return { result: 'error', err };
	}
};
