import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { orbiterVersion } from '$lib/api/orbiter.deprecated.api';
import { getNewestReleasesMetadata } from '$lib/rest/cdn.rest';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { versionStore } from '$lib/stores/version.store';
import type { Option } from '$lib/types/utils';
import type { LoadVersionBaseParams, LoadVersionResult, VersionMetadata } from '$lib/types/version';
import { container } from '$lib/utils/juno.utils';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish } from '@dfinity/utils';
import { getJunoPackage } from '@junobuild/admin';
import { get } from 'svelte/store';

export const reloadOrbiterVersion = async ({
	orbiter,
	toastError = true,
	...rest
}: {
	orbiter: Option<Orbiter>;
} & LoadVersionBaseParams): Promise<LoadVersionResult> => {
	const result = await loadOrbiterVersion({
		orbiter,
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
	orbiter,
	identity,
	skipReload
}: {
	orbiter: Option<Orbiter>;
} & Omit<LoadVersionBaseParams, 'toastError'>): Promise<LoadVersionResult> => {
	// Optional for convenience reasons.
	if (isNullish(orbiter)) {
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

		const orbiterInfo = async (orbiterId: Principal): Promise<Omit<VersionMetadata, 'release'>> => {
			const [junoPkg] = await Promise.allSettled([
				getJunoPackage({
					moduleId: orbiterId,
					identity,
					...container()
				})
			]);

			if (junoPkg.status === 'fulfilled' && nonNullish(junoPkg.value)) {
				const pkg = junoPkg.value;
				const { version } = pkg;

				return {
					current: version,
					pkg
				};
			}

			// Legacy way of fetch build and version information
			const version = await orbiterVersion({ orbiterId, identity });

			return {
				current: version
			};
		};

		const [orbVersion, releases] = await Promise.all([
			orbiterInfo(orbiter.orbiter_id),
			// TODO: we can probably improve - reduce the number of queries on the CDN - by caching in store the releases metadata
			// instead of re-querying those every time separately.
			getNewestReleasesMetadata()
		]);

		versionStore.setOrbiter({
			release: releases.orbiter,
			...orbVersion
		});

		return { result: 'loaded' };
	} catch (err: unknown) {
		return { result: 'error', err };
	}
};
