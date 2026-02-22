import type { SatelliteDid } from '$declarations';
import { listDocs as listDocsApi } from '$lib/api/satellites.api';
import { listDocs008 } from '$lib/api/satellites.deprecated.api';
import { SATELLITE_v0_0_9 } from '$lib/constants/version.constants';
import { isSatelliteFeatureSupported } from '$lib/services/_feature.services';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ListParams } from '$lib/types/list';
import type { Principal } from '@icp-sdk/core/principal';

export type ListDocsParams = ListParams & {
	satelliteId: Principal;
	identity: OptionIdentity;
};

export interface ListDocsResult<T> {
	items: [string, T][];
	matches_length: bigint;
	items_length: bigint;
}

export type ListDocsFn<T> = (params: ListDocsParams) => Promise<ListDocsResult<T>>;

export const listDocs = async ({
	collection,
	startAfter,
	satelliteId,
	filter,
	order,
	limit,
	identity
}: ListDocsParams & {
	collection: string;
}): Promise<{
	items: [string, SatelliteDid.Doc][];
	matches_length: bigint;
	items_length: bigint;
}> => {
	const newestListDocs = isSatelliteFeatureSupported({
		satelliteId,
		requiredMinVersion: SATELLITE_v0_0_9
	});

	const list = newestListDocs ? listDocsApi : listDocs008;

	const { items, matches_length, items_length } = await list({
		collection,
		satelliteId,
		params: {
			startAfter,
			order: order ?? {
				desc: true,
				field: 'created_at'
			},
			filter,
			limit
		},
		identity
	});

	return { items, matches_length, items_length };
};
