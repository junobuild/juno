import { countCollectionAssets, switchStorageSystemMemory } from '$lib/api/satellites.api';
import { COLLECTION_DAPP } from '$lib/constants/storage.constants';
import { SATELLITE_v0_0_20 } from '$lib/constants/version.constants';
import { instantSatelliteVersion } from '$lib/services/feature.services';
import { busy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { MissionControlDid } from '$lib/types/declarations';
import type { OptionIdentity } from '$lib/types/itentity';
import { nonNullish } from '@dfinity/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

export const countHostingAssets = async ({
	satellite,
	identity
}: {
	satellite: MissionControlDid.Satellite;
	identity: OptionIdentity;
}): Promise<
	| {
			result: 'success';
			count: bigint;
	  }
	| { result: 'error' }
	| { result: 'skip' }
> => {
	try {
		const version = instantSatelliteVersion({ satelliteId: satellite.satellite_id });

		if (nonNullish(version) && compare(version, SATELLITE_v0_0_20) < 0) {
			// For simplicity reasons we do not display the information for not up-to-date Satellite.
			// In Satellite v0.0.20, the endpoint to list the number of assets in a collection was renamed from `count_assets` to `count_collection_assets`.
			return { result: 'skip' };
		}

		const count = await countCollectionAssets({
			satelliteId: satellite.satellite_id,
			collection: COLLECTION_DAPP,
			identity
		});

		return {
			result: 'success',
			count
		};
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.hosting_count_assets,
			detail: err
		});

		return { result: 'error' };
	}
};

export const switchHostingMemory = async ({
	satellite,
	identity
}: {
	satellite: MissionControlDid.Satellite;
	identity: OptionIdentity;
}): Promise<
	| {
			result: 'success';
	  }
	| { result: 'error' }
> => {
	busy.start();

	try {
		await switchStorageSystemMemory({
			satelliteId: satellite.satellite_id,
			identity
		});

		return {
			result: 'success'
		};
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.hosting_switch_memory,
			detail: err
		});

		return { result: 'error' };
	} finally {
		busy.stop();
	}
};
