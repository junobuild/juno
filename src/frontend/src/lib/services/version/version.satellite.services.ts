import { getNewestReleasesMetadata } from '$lib/rest/cdn.rest';
import { getSatelliteVersionMetadata } from '$lib/services/version/version.metadata.satellite.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { versionStore } from '$lib/stores/version.store';
import type { LoadVersionBaseParams, LoadVersionResult } from '$lib/types/version';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const reloadSatelliteVersion = async ({
	satelliteId,
	toastError = true,
	...rest
}: {
	satelliteId: Principal;
} & LoadVersionBaseParams): Promise<LoadVersionResult> => {
	const result = await loadSatelliteVersion({
		satelliteId,
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

const loadSatelliteVersion = async ({
	satelliteId,
	identity,
	skipReload
}: {
	satelliteId: Principal;
} & Omit<LoadVersionBaseParams, 'toastError'>): Promise<LoadVersionResult> => {
	// We load the satellite version once per session
	const store = get(versionStore);
	if (nonNullish(store.satellites[satelliteId.toText()]) && skipReload) {
		return { result: 'skipped' };
	}

	try {
		// Optional for convenience reasons. A guard prevent the usage of the service while not being sign-in.
		assertNonNullish(identity);

		const [metadata, releases] = await Promise.all([
			getSatelliteVersionMetadata({ identity, satelliteId }),
			getNewestReleasesMetadata()
		]);

		// We display an error if the metadata when unexpectedly not found but set the version as null - i.e. do not return
		if ('notFound' in metadata) {
			toasts.error({
				text: get(i18n).errors.satellite_version_not_found
			});
		}

		const satVersion = 'metadata' in metadata ? metadata.metadata : null;

		versionStore.setSatellite({
			satelliteId: satelliteId.toText(),
			version: nonNullish(satVersion)
				? {
						release: releases.satellite,
						...satVersion
					}
				: null
		});

		return { result: 'loaded' };
	} catch (err: unknown) {
		versionStore.setSatellite({
			satelliteId: satelliteId.toText(),
			version: null
		});

		return { result: 'error', err };
	}
};
