import type { ListParams } from '$declarations/satellite/satellite.did';
import { toNullable } from '@dfinity/utils';

export const mockListParams: ListParams = {
	matcher: toNullable(),
	order: toNullable(),
	owner: toNullable(),
	paginate: toNullable()
};
