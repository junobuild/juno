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
import type { OptionIdentity } from '$lib/types/itentity';
import type { ListParams } from '$lib/types/list';
import { getSatelliteActor } from '$lib/utils/actor.juno.utils';
import { memoryFromText, permissionFromText } from '$lib/utils/rules.utils';
import { toListParams } from '$lib/utils/satellite.utils';
import { Principal } from '@dfinity/principal';
import { fromNullable, isNullish, nonNullish, toNullable } from '@dfinity/utils';

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
	const actor = await getSatelliteActor({ satelliteId, identity });
	return actor.list_docs(collection, toListParams(params));
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
	type: RulesType;
	identity: OptionIdentity;
}): Promise<[string, Rule][]> => {
	const actor = await getSatelliteActor({ satelliteId, identity });
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
	mutablePermissions,
	identity
}: {
	satelliteId: Principal;
	collection: string;
	read: PermissionText;
	write: PermissionText;
	type: RulesType;
	memory: MemoryText;
	rule: Rule | undefined;
	maxSize: number | undefined;
	mutablePermissions: boolean;
	identity: OptionIdentity;
}) => {
	const updateRule: SetRule = {
		read: permissionFromText(read),
		write: permissionFromText(write),
		updated_at: isNullish(rule) ? [] : [rule.updated_at],
		max_size: toNullable(nonNullish(maxSize) && maxSize > 0 ? BigInt(maxSize) : undefined),
		memory: isNullish(rule) ? [memoryFromText(memory)] : [fromNullable(rule.memory) ?? MemoryHeap],
		mutable_permissions: toNullable(mutablePermissions)
	};

	const actor = await getSatelliteActor({ satelliteId, identity });
	await actor.set_rule(type, collection, updateRule);
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
	type: RulesType;
	rule: Rule;
	identity: OptionIdentity;
}) => {
	const delRule: DelRule = {
		updated_at: [rule.updated_at]
	};

	const actor = await getSatelliteActor({ satelliteId, identity });
	await actor.del_rule(type, collection, delRule);
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
	const actor = await getSatelliteActor({ satelliteId, identity });
	return actor.version();
};

export const setCustomDomain = async ({
	satelliteId,
	domainName,
	boundaryNodesId,
	identity
}: {
	satelliteId: Principal;
	domainName: string;
	boundaryNodesId: string | undefined;
	identity: OptionIdentity;
}): Promise<void> => {
	const actor = await getSatelliteActor({ satelliteId, identity });
	await actor.set_custom_domain(domainName, toNullable(boundaryNodesId));
};

export const deleteCustomDomain = async ({
	satelliteId,
	domainName,
	identity
}: {
	satelliteId: Principal;
	domainName: string;
	identity: OptionIdentity;
}): Promise<void> => {
	const actor = await getSatelliteActor({ satelliteId, identity });
	await actor.del_custom_domain(domainName);
};

export const listCustomDomains = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<[string, CustomDomain][]> => {
	const actor = await getSatelliteActor({ satelliteId, identity });
	return actor.list_custom_domains();
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
	const actor = await getSatelliteActor({ satelliteId, identity });
	const { updated_at } = doc ?? { updated_at: undefined };
	return actor.del_doc(collection, key, {
		updated_at: toNullable(updated_at)
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
