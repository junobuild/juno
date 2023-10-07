import type { Controller } from '$declarations/mission_control/mission_control.did';
import type {
	CustomDomain,
	DelDoc as DelRule,
	Doc,
	ListResults as ListAssets,
	ListResults_1 as ListDocs,
	Rule,
	RulesType,
	SetRule
} from '$declarations/satellite/satellite.did';
import type { MemoryText, PermissionText } from '$lib/constants/rules.constants';
import { MemoryHeap } from '$lib/constants/rules.constants';
import type { ListParams } from '$lib/types/list';
import { getSatelliteActor } from '$lib/utils/actor.juno.utils';
import { toNullable } from '$lib/utils/did.utils';
import { memoryFromText, permissionFromText } from '$lib/utils/rules.utils';
import { toListParams } from '$lib/utils/satellite.utils';
import { isNullish, nonNullish } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';

export const listDocs = async ({
	satelliteId,
	collection,
	params
}: {
	satelliteId: Principal;
	collection: string;
	params: ListParams;
}): Promise<ListDocs> => {
	const actor = await getSatelliteActor(satelliteId);
	return actor.list_docs(collection, toListParams(params));
};

export const listAssets = async ({
	satelliteId,
	collection,
	params
}: {
	satelliteId: Principal;
	collection: string;
	params: ListParams;
}): Promise<ListAssets> => {
	const actor = await getSatelliteActor(satelliteId);
	return actor.list_assets(collection, toListParams(params));
};

export const listRules = async ({
	satelliteId,
	type
}: {
	satelliteId: Principal;
	type: RulesType;
}): Promise<[string, Rule][]> => {
	const actor = await getSatelliteActor(satelliteId);
	return actor.list_rules(type);
};

export const setRule = async ({
	satelliteId,
	collection,
	read,
	write,
	type,
	memory,
	rule,
	maxSize,
	mutable
}: {
	satelliteId: Principal;
	collection: string;
	read: PermissionText;
	write: PermissionText;
	type: RulesType;
	memory: MemoryText;
	rule: Rule | undefined;
	maxSize: number | undefined;
	mutable: boolean
}) => {
	const updateRule: SetRule = {
		read: permissionFromText(read),
		write: permissionFromText(write),
		updated_at: isNullish(rule) ? [] : [rule.updated_at],
		max_size: toNullable(nonNullish(maxSize) && maxSize > 0 ? BigInt(maxSize) : undefined),
		memory: isNullish(rule) ? [memoryFromText(memory)] : [rule.memory ?? MemoryHeap],
		mutable: toNullable(mutable)
	};

	const actor = await getSatelliteActor(satelliteId);
	await actor.set_rule(type, collection, updateRule);
};

export const deleteRule = async ({
	satelliteId,
	collection,
	type,
	rule
}: {
	satelliteId: Principal;
	collection: string;
	type: RulesType;
	rule: Rule;
}) => {
	const delRule: DelRule = {
		updated_at: [rule.updated_at]
	};

	const actor = await getSatelliteActor(satelliteId);
	await actor.del_rule(type, collection, delRule);
};

export const listControllers = async ({
	satelliteId
}: {
	satelliteId: Principal;
}): Promise<[Principal, Controller][]> => {
	const actor = await getSatelliteActor(satelliteId);
	return actor.list_controllers();
};

export const satelliteVersion = async ({
	satelliteId
}: {
	satelliteId: Principal;
}): Promise<string> => {
	const actor = await getSatelliteActor(satelliteId);
	return actor.version();
};

export const setCustomDomain = async ({
	satelliteId,
	domainName,
	boundaryNodesId
}: {
	satelliteId: Principal;
	domainName: string;
	boundaryNodesId: string | undefined;
}): Promise<void> => {
	const actor = await getSatelliteActor(satelliteId);
	await actor.set_custom_domain(domainName, toNullable(boundaryNodesId));
};

export const deleteCustomDomain = async ({
	satelliteId,
	domainName
}: {
	satelliteId: Principal;
	domainName: string;
}): Promise<void> => {
	const actor = await getSatelliteActor(satelliteId);
	await actor.del_custom_domain(domainName);
};

export const listCustomDomains = async ({
	satelliteId
}: {
	satelliteId: Principal;
}): Promise<[string, CustomDomain][]> => {
	const actor = await getSatelliteActor(satelliteId);
	return actor.list_custom_domains();
};

export const deleteDoc = async ({
	satelliteId,
	collection,
	key,
	doc
}: {
	satelliteId: Principal;
	collection: string;
	key: string;
	doc: Doc | undefined;
}) => {
	const actor = await getSatelliteActor(satelliteId);
	const { updated_at } = doc ?? { updated_at: undefined };
	return actor.del_doc(collection, key, {
		updated_at: toNullable(updated_at)
	});
};

export const deleteAsset = async ({
	satelliteId,
	collection,
	full_path
}: {
	satelliteId: Principal;
	collection: string;
	full_path: string;
}) => {
	const actor = await getSatelliteActor(satelliteId);
	return actor.del_asset(collection, full_path);
};
