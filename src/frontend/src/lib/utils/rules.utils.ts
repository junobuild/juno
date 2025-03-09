import type { Memory, Permission } from '$declarations/satellite/satellite.did';
import {
	MemoryHeap,
	MemoryStable,
	type MemoryText,
	PermissionControllers,
	PermissionManaged,
	PermissionPrivate,
	PermissionPublic,
	type PermissionText
} from '$lib/constants/rules.constants';

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
