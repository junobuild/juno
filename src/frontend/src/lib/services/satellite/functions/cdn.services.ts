import type { SatelliteDid } from '$declarations';
import { listAssets } from '$lib/api/satellites.api';
import { COLLECTION_CDN_RELEASES } from '$lib/constants/storage.constants';
import type { ListDocsParams, ListDocsResult } from '$lib/services/satellite/_list-docs.services';

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
