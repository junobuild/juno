import {
	MemoryHeap,
	MemoryStable,
	type MemoryText,
	PermissionManaged,
	PermissionPrivate,
	PermissionPublic,
	PermissionRestricted,
	type PermissionText
} from '$lib/constants/rules.constants';
import type { SatelliteDid } from '$lib/types/declarations';

export const permissionFromText = (text: PermissionText): SatelliteDid.Permission => {
	switch (text) {
		case 'Public':
			return PermissionPublic;
		case 'Private':
			return PermissionPrivate;
		case 'Managed':
			return PermissionManaged;
		default:
			return PermissionRestricted;
	}
};

export const permissionToText = (permission: SatelliteDid.Permission): PermissionText => {
	if ('Public' in permission) {
		return 'Public';
	}

	if ('Private' in permission) {
		return 'Private';
	}

	if ('Managed' in permission) {
		return 'Managed';
	}

	return 'Restricted';
};

export const memoryFromText = (text: MemoryText): SatelliteDid.Memory => {
	switch (text) {
		case 'Stable':
			return MemoryStable;
		default:
			return MemoryHeap;
	}
};

export const memoryToText = (memory: SatelliteDid.Memory): MemoryText => {
	if ('Stable' in memory) {
		return 'Stable';
	}

	return 'Heap';
};
