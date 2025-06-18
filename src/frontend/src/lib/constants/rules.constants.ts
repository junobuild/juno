import type {
	CollectionType,
	ListRulesParams,
	Memory,
	Permission
} from '$declarations/satellite/satellite.did';
import { toNullable } from '@dfinity/utils';

export const DbCollectionType: CollectionType = { Db: null };
export const StorageCollectionType: CollectionType = { Storage: null };

export const PermissionPublic: Permission = { Public: null };
export const PermissionPrivate: Permission = { Private: null };
export const PermissionManaged: Permission = { Managed: null };

// Originally named "Controllers" but later renamed visually — and only visually — to "Trusted Keys",
// since it includes both "Admin" (controllers) and "Write" keys (which are not controllers).
const PermissionControllers: Permission = { Controllers: null };
export const PermissionTrustedKeys = PermissionControllers;

export type PermissionText = 'Public' | 'Private' | 'Managed' | 'TrustedKeys';

export const MemoryHeap: Memory = { Heap: null };
export const MemoryStable: Memory = { Stable: null };

export type MemoryText = 'Heap' | 'Stable';

export const filterSystemRules: ListRulesParams = {
	matcher: toNullable()
};
