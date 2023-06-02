import type { Memory, Permission, RulesType } from '$declarations/satellite/satellite.did';

export const DbRulesType: RulesType = { Db: null };
export const StorageRulesType: RulesType = { Storage: null };

export const PermissionPublic: Permission = { Public: null };
export const PermissionPrivate: Permission = { Private: null };
export const PermissionManaged: Permission = { Managed: null };
export const PermissionControllers: Permission = { Controllers: null };

export type PermissionText = 'Public' | 'Private' | 'Managed' | 'Controllers';

export const MemoryHeap: Memory = { Heap: null };
export const MemoryStable: Memory = { Stable: null };

export type MemoryText = 'Heap' | 'Stable';
