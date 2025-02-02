import type { CollectionType, Memory, Permission } from '$declarations/satellite/satellite.did';
import { listRules } from '$lib/api/satellites.api';
import { listRulesDeprecated } from '$lib/api/satellites.deprecated.api';
import {
	MemoryHeap,
	MemoryStable,
	PermissionControllers,
	PermissionManaged,
	PermissionPrivate,
	PermissionPublic,
	type MemoryText,
	type PermissionText
} from '$lib/constants/rules.constants';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { RulesStore } from '$lib/types/rules.context';
import type { Principal } from '@dfinity/principal';
import type { Writable } from 'svelte/store';

export const permissionFromText = (text: PermissionText): Permission => {
	switch (text) {
		case 'Public':
			return PermissionPublic;
		case 'Private':
			return PermissionPrivate;
		case 'Managed':
			return PermissionManaged;
		default:
			return PermissionControllers;
	}
};

export const permissionToText = (permission: Permission): PermissionText => {
	if ('Public' in permission) {
		return 'Public';
	}

	if ('Private' in permission) {
		return 'Private';
	}

	if ('Managed' in permission) {
		return 'Managed';
	}

	return 'Controllers';
};

export const memoryFromText = (text: MemoryText): Memory => {
	switch (text) {
		case 'Stable':
			return MemoryStable;
		default:
			return MemoryHeap;
	}
};

export const memoryToText = (memory: Memory): MemoryText => {
	if ('Stable' in memory) {
		return 'Stable';
	}

	return 'Heap';
};

export const reloadContextRules = async ({
	satelliteId,
	type,
	store,
	identity
}: {
	satelliteId: Principal;
	store: Writable<RulesStore>;
	type: CollectionType;
	identity: OptionIdentity;
}) => {
	try {
		const rules = await listRules({ satelliteId, type, identity });
		store.set({ satelliteId, rules, rule: undefined });
	} catch (err: unknown) {
		// TODO: remove backward compatibility stuffs
		try {
			const rules = await listRulesDeprecated({ satelliteId, identity, type });
			store.set({ satelliteId, rules, rule: undefined });
			return;
		} catch (_: unknown) {
			// Ignore error of the workaround
		}

		store.set({ satelliteId, rules: undefined, rule: undefined });

		toasts.error({
			text: `Error while listing the rules.`,
			detail: err
		});
	}
};
