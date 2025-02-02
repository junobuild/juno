import type { Controller } from '$declarations/mission_control/mission_control.did';
import type {
	AuthenticationConfig,
	CollectionType,
	DelDoc as DelRule,
	Doc,
	ListResults as ListAssets,
	ListResults_1 as ListDocs,
	Rule,
	SetRule
} from '$declarations/satellite/satellite.did';
import { getSatelliteActor } from '$lib/api/actors/actor.juno.api';
import type { CustomDomains } from '$lib/types/custom-domain';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ListParams } from '$lib/types/list';
import { toListParams } from '$lib/utils/satellite.utils';
import { Principal } from '@dfinity/principal';
import { isNullish, toNullable } from '@dfinity/utils';

export const listDocs = async ({
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
	const { list_docs } = await getSatelliteActor({ satelliteId, identity });
	return list_docs(collection, toListParams(params));
};

export const listAssets = async ({
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
	const actor = await getSatelliteActor({ satelliteId, identity });
	return actor.list_assets(collection, toListParams(params));
};

export const listRules = async ({
	satelliteId,
	type,
	identity
}: {
	satelliteId: Principal;
	type: CollectionType;
	identity: OptionIdentity;
}): Promise<[string, Rule][]> => {
	const actor = await getSatelliteActor({ satelliteId, identity });
	return actor.list_rules(type);
};

export const getRule = async ({
	satelliteId,
	type,
	identity,
	collection
}: {
	satelliteId: Principal;
	type: CollectionType;
	identity: OptionIdentity;
	collection: string;
}): Promise<[] | [Rule]> => {
	const { get_rule } = await getSatelliteActor({ satelliteId, identity });
	return get_rule(type, collection);
};

export const setRule = async ({
	satelliteId,
	collection,
	type,
	rule,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	type: CollectionType;
	identity: OptionIdentity;
	rule: SetRule;
}): Promise<Rule> => {
	const { set_rule } = await getSatelliteActor({ satelliteId, identity });
	return await set_rule(type, collection, rule);
};

export const deleteRule = async ({
	satelliteId,
	collection,
	type,
	rule,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	type: CollectionType;
	rule: Rule;
	identity: OptionIdentity;
}) => {
	const delRule: DelRule = {
		version: rule.version
	};

	const { del_rule } = await getSatelliteActor({ satelliteId, identity });
	await del_rule(type, collection, delRule);
};

export const listControllers = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<[Principal, Controller][]> => {
	const actor = await getSatelliteActor({ satelliteId, identity });
	return actor.list_controllers();
};

export const satelliteVersion = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<string> => {
	const { version } = await getSatelliteActor({ satelliteId, identity });
	return version();
};

export const satelliteBuildVersion = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<string> => {
	const { build_version } = await getSatelliteActor({ satelliteId, identity });
	return build_version();
};

export const setCustomDomain = async ({
	domainName,
	boundaryNodesId,
	...rest
}: {
	satelliteId: Principal;
	domainName: string;
	boundaryNodesId: string | undefined;
	identity: OptionIdentity;
}): Promise<void> => {
	const { set_custom_domain } = await getSatelliteActor(rest);
	await set_custom_domain(domainName, toNullable(boundaryNodesId));
};

export const deleteCustomDomain = async ({
	domainName,
	...rest
}: {
	satelliteId: Principal;
	domainName: string;
	identity: OptionIdentity;
}): Promise<void> => {
	const { del_custom_domain } = await getSatelliteActor(rest);
	await del_custom_domain(domainName);
};

export const listCustomDomains = async (params: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<CustomDomains> => {
	const { list_custom_domains } = await getSatelliteActor(params);
	return list_custom_domains();
};

export const getAuthConfig = async (params: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<[] | [AuthenticationConfig]> => {
	const { get_auth_config } = await getSatelliteActor(params);
	return get_auth_config();
};

export const setAuthConfig = async ({
	config,
	...rest
}: {
	satelliteId: Principal;
	config: AuthenticationConfig;
	identity: OptionIdentity;
}): Promise<void> => {
	const { set_auth_config } = await getSatelliteActor(rest);
	return set_auth_config(config);
};

export const deleteDoc = async ({
	satelliteId,
	collection,
	key,
	doc,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	key: string;
	doc: Doc | undefined;
	identity: OptionIdentity;
}) => {
	const { del_doc } = await getSatelliteActor({ satelliteId, identity });
	return del_doc(collection, key, {
		version: isNullish(doc) ? [] : doc.version
	});
};

export const deleteAsset = async ({
	satelliteId,
	collection,
	full_path,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	full_path: string;
	identity: OptionIdentity;
}) => {
	const actor = await getSatelliteActor({ satelliteId, identity });
	return actor.del_asset(collection, full_path);
};

export const deleteDocs = async ({
	satelliteId,
	collection,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	identity: OptionIdentity;
}) => {
	const { del_docs } = await getSatelliteActor({ satelliteId, identity });
	return del_docs(collection);
};

export const deleteAssets = async ({
	satelliteId,
	collection,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	identity: OptionIdentity;
}) => {
	const { del_assets } = await getSatelliteActor({ satelliteId, identity });
	return del_assets(collection);
};

export const depositCycles = async ({
	satelliteId,
	cycles,
	destinationId: destination_id,
	identity
}: {
	satelliteId: Principal;
	cycles: bigint;
	destinationId: Principal;
	identity: OptionIdentity;
}) => {
	const { deposit_cycles } = await getSatelliteActor({ satelliteId, identity });
	return deposit_cycles({
		cycles,
		destination_id
	});
};

export const countCollectionAssets = async ({
	satelliteId,
	collection,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	identity: OptionIdentity;
}): Promise<bigint> => {
	const { count_collection_assets } = await getSatelliteActor({ satelliteId, identity });
	return count_collection_assets(collection);
};
