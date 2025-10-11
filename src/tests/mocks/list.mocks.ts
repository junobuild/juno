import type { SatelliteDid } from '$declarations';
import { toNullable } from '@dfinity/utils';

export const mockListParams: SatelliteDid.ListParams = {
	matcher: toNullable(),
	order: toNullable(),
	owner: toNullable(),
	paginate: toNullable()
};

export const mockListProposalsParams: SatelliteDid.ListProposalsParams = {
	paginate: toNullable(),
	order: toNullable()
};

export const mockListRules: SatelliteDid.ListRulesParams = {
	matcher: toNullable()
};
