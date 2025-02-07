import type { SetRule } from '$declarations/satellite/satellite.did';
import { toNullable } from '@dfinity/utils';

export const mockSetRule: SetRule = {
	memory: toNullable({ Heap: null }),
	max_size: toNullable(),
	max_capacity: toNullable(),
	read: { Managed: null },
	mutable_permissions: toNullable(),
	write: { Managed: null },
	version: toNullable(),
	rate_config: toNullable(),
	max_changes_per_user: toNullable()
};
