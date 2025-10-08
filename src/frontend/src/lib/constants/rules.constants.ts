import type { SatelliteDid } from '$lib/types/declarations';
import { toNullable } from '@dfinity/utils';

export const DbCollectionType: SatelliteDid.CollectionType = { Db: null };
export const StorageCollectionType: SatelliteDid.CollectionType = { Storage: null };

export const PermissionPublic: SatelliteDid.Permission = { Public: null };
export const PermissionPrivate: SatelliteDid.Permission = { Private: null };
export const PermissionManaged: SatelliteDid.Permission = { Managed: null };

// Originally named "Controllers" but later renamed visually — and only visually — to "Trusted Keys",
// since it includes both "Admin" (controllers) and "Write" keys (which are not controllers).
const PermissionControllers: SatelliteDid.Permission = { Controllers: null };
export const PermissionRestricted = PermissionControllers;

export type PermissionText = 'Public' | 'Private' | 'Managed' | 'Restricted';

export const MemoryHeap: SatelliteDid.Memory = { Heap: null };
export const MemoryStable: SatelliteDid.Memory = { Stable: null };

export type MemoryText = 'Heap' | 'Stable';

export const filterSystemRules: SatelliteDid.ListRulesParams = {
	matcher: toNullable()
};
