import type {
	CustomDomain,
	ListResults as ListAssets,
	ListResults_1 as ListDocs,
	Rule,
	RulesType,
	SetRule
} from '$declarations/satellite/satellite.did';
import type { PermissionText } from '$lib/constants/rules.constants';
import { getSatelliteActor } from '$lib/utils/actor.utils';
import { toNullable } from '$lib/utils/did.utils';
import { permissionFromText } from '$lib/utils/rules.utils';
import { listParams } from '$lib/utils/satellite.utils';
import { isNullish, nonNullish } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';

export const listDocs = async ({
	satelliteId,
	collection,
	startAfter
}: {
	satelliteId: Principal;
	collection: string;
	startAfter?: string;
}): Promise<ListDocs> => {
	const actor = await getSatelliteActor(satelliteId);
	return actor.list_docs(collection, listParams({ startAfter }));
};

export const listAssets = async ({
	satelliteId,
	collection,
	startAfter
}: {
	satelliteId: Principal;
	collection: string;
	startAfter?: string;
}): Promise<ListAssets> => {
	const actor = await getSatelliteActor(satelliteId);
	return actor.list_assets(toNullable(collection), listParams({ startAfter }));
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
	rule,
	maxSize
}: {
	satelliteId: Principal;
	collection: string;
	read: PermissionText;
	write: PermissionText;
	type: RulesType;
	rule: Rule | undefined;
	maxSize: number | undefined;
}) => {
	const updateRule: SetRule = {
		read: permissionFromText(read),
		write: permissionFromText(write),
		updated_at: isNullish(rule) ? [] : [rule.updated_at],
		max_size: toNullable(nonNullish(maxSize) && maxSize > 0 ? BigInt(maxSize) : undefined)
	};

	const actor = await getSatelliteActor(satelliteId);
	await actor.set_rule(type, collection, updateRule);
};

export const listControllers = async ({
	satelliteId
}: {
	satelliteId: Principal;
}): Promise<Principal[]> => {
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
