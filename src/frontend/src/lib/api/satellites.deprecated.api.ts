import type { ListParams as ListParamsApi } from '$declarations/deprecated/satellite-0-0-8.did';
import type {
	AssetNoContent,
	CollectionType,
	Doc,
	ListResults as ListAssets,
	ListResults_1 as ListDocs,
	Rule
} from '$declarations/satellite/satellite.did';
import {
	getSatelliteActor0021,
	getSatelliteActor0022,
	getSatelliteActor008,
	getSatelliteActor009
} from '$lib/api/actors/actor.deprecated.api';
import { PAGINATION } from '$lib/constants/app.constants';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ListParams } from '$lib/types/list';
import { toListParams } from '$lib/utils/satellite.utils';
import { Principal } from '@dfinity/principal';
import { isNullish, toNullable } from '@dfinity/utils';

const toListParams008 = ({
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
	params,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	params: ListParams;
	identity: OptionIdentity;
}): Promise<ListDocs> => {
	const actor = await getSatelliteActor008({ satelliteId, identity });
	const {
		items,
		length: items_length,
		matches_length
	} = await actor.list_docs(collection, toListParams008(params));
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
	params,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	params: ListParams;
	identity: OptionIdentity;
}): Promise<ListAssets> => {
	const actor = await getSatelliteActor008({ satelliteId, identity });
	const {
		items,
		length: items_length,
		matches_length
	} = await actor.list_assets(toNullable(collection), toListParams008(params));
	return {
		items: items as [string, AssetNoContent][],
		items_length,
		items_page: [],
		matches_length,
		matches_pages: []
	};
};

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const listAssets009 = async ({
	satelliteId,
	collection,
	params,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	params: ListParams;
	identity: OptionIdentity;
}): Promise<ListAssets> => {
	const actor = await getSatelliteActor009({ satelliteId, identity });
	const { items, ...rest } = await actor.list_assets(toNullable(collection), toListParams(params));
	return {
		items: items.map(([key, asset]) => [key, { ...asset, version: [] }]),
		...rest
	};
};

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const listRulesDeprecated = async ({
	satelliteId,
	type,
	identity
}: {
	satelliteId: Principal;
	type: CollectionType;
	identity: OptionIdentity;
}): Promise<[string, Rule][]> => {
	const actor = await getSatelliteActor008({ satelliteId, identity });
	const rules = await actor.list_rules(type);
	return rules.map(([key, rule]) => [
		key,
		{
			...rule,
			version: [],
			memory: [{ Heap: null }]
		} as Rule
	]);
};

/**
 * @deprecated - Replaced in Satellite > v0.0.22 with public custom section juno:package
 */
export const satelliteVersion = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<string> => {
	// For simplicity reason we just use an old actor (21 instead of 22) as the API did not change until it was fully deprecated.
	const { version } = await getSatelliteActor0021({ satelliteId, identity });
	return version();
};

/**
 * @deprecated - Replaced in Satellite > v0.0.22 with public custom section juno:package
 */
export const satelliteBuildVersion = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<string> => {
	// For simplicity reason we just use an old actor (21 instead of 22) as the API did not change until it was fully deprecated.
	const { build_version } = await getSatelliteActor0021({ satelliteId, identity });
	return build_version();
};

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const listRules0022 = async ({
	satelliteId,
	type,
	identity
}: {
	satelliteId: Principal;
	type: CollectionType;
	identity: OptionIdentity;
}): Promise<[string, Rule][]> => {
	const actor = await getSatelliteActor0022({ satelliteId, identity });
	return actor.list_rules(type);
};
