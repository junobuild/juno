import type { ListParams as ListParamsApi } from '$declarations/deprecated/satellite-0-0-8.did';
import type {
	AssetNoContent,
	Doc,
	ListResults as ListAssets,
	ListResults_1 as ListDocs
} from '$declarations/satellite/satellite.did';
import { PAGINATION } from '$lib/constants/constants';
import type { ListParams } from '$lib/types/list';
import { getSatelliteActor008 } from '$lib/utils/actor.deprecated.utils';
import { toNullable } from '$lib/utils/did.utils';
import { isNullish } from '$lib/utils/utils';
import { Principal } from '@dfinity/principal';

const toListParams = ({
	startAfter,
	order,
	filter: { matcher, owner }
}: ListParams): ListParamsApi => ({
	matcher: toNullable(matcher === '' ? null : matcher),
	paginate: [
		{
			start_after: toNullable(startAfter),
			limit: [PAGINATION]
		}
	],
	order: [
		{
			desc: order.desc,
			field:
				order.field === 'created_at'
					? { CreatedAt: null }
					: order.field === 'updated_at'
					? { UpdatedAt: null }
					: { Keys: null }
		}
	],
	owner: toNullable(owner === '' || isNullish(owner) ? null : Principal.fromText(owner))
});

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const listDocs008 = async ({
	satelliteId,
	collection,
	params
}: {
	satelliteId: Principal;
	collection: string;
	params: ListParams;
}): Promise<ListDocs> => {
	const actor = await getSatelliteActor008(satelliteId);
	const {
		items,
		length: items_length,
		matches_length
	} = await actor.list_docs(collection, toListParams(params));
	return {
		items: items as [string, Doc][],
		items_length,
		items_page: [],
		matches_length,
		matches_pages: []
	};
};

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const listAssets008 = async ({
	satelliteId,
	collection,
	params
}: {
	satelliteId: Principal;
	collection: string;
	params: ListParams;
}): Promise<ListAssets> => {
	const actor = await getSatelliteActor008(satelliteId);
	const {
		items,
		length: items_length,
		matches_length
	} = await actor.list_assets(toNullable(collection), toListParams(params));
	return {
		items: items as [string, AssetNoContent][],
		items_length,
		items_page: [],
		matches_length,
		matches_pages: []
	};
};
