import type { SatelliteDid } from '$declarations';
import type { listDocs as listDocsApi } from '$lib/api/satellites.api';
import type { listDocs008 } from '$lib/api/satellites.deprecated.api';
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
	identity,
	listFn
}: ListDocsParams & {
	collection: string;
	listFn: typeof listDocsApi | typeof listDocs008;
}): Promise<{
	items: [string, SatelliteDid.Doc][];
	matches_length: bigint;
	items_length: bigint;
}> => {
	const { items, matches_length, items_length } = await listFn({
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
