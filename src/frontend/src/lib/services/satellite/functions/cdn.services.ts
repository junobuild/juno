import type { SatelliteDid } from '$declarations';
import { deleteAsset, listAssets } from '$lib/api/satellites.api';
import { COLLECTION_CDN_RELEASES } from '$lib/constants/storage.constants';
import type { ListDocsParams, ListDocsResult } from '$lib/services/satellite/_list-docs.services';
import type { NullishIdentity } from '$lib/types/itentity';
import type { Satellite } from '$lib/types/satellite';
import type { Result } from '@dfinity/zod-schemas';

export const listWasmAssets = async ({
	satelliteId,
	identity,
	...params
}: ListDocsParams): Promise<ListDocsResult<SatelliteDid.AssetNoContent>> => {
	const { items, matches_length, items_length } = await listAssets({
		satelliteId,
		identity,
		collection: COLLECTION_CDN_RELEASES,
		params
	});

	return { items, matches_length, items_length };
};

export const deleteWasmAsset = async ({
	asset,
	satellite,
	identity
}: {
	asset: SatelliteDid.AssetNoContent;
	satellite: Satellite;
	identity: NullishIdentity;
}): Promise<Result<undefined>> => {
	try {
		const {
			key: { full_path }
		} = asset;

		await deleteAsset({
			satelliteId: satellite.satellite_id,
			collection: COLLECTION_CDN_RELEASES,
			full_path,
			identity
		});

		return { status: 'success', result: undefined };
	} catch (err: unknown) {
		return { status: 'error', err };
	}
};
