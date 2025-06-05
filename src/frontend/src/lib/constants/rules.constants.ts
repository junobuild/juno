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
export const PermissionControllers: Permission = { Controllers: null };

export type PermissionText = 'Public' | 'Private' | 'Managed' | 'Controllers';

export const MemoryHeap: Memory = { Heap: null };
export const MemoryStable: Memory = { Stable: null };

export type MemoryText = 'Heap' | 'Stable';

export const filterSystemRules: ListRulesParams = {
	matcher: toNullable()
};
