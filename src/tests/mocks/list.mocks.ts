import type {
	ListParams,
	ListProposalsParams,
	ListRulesParams
} from '$declarations/satellite/satellite.did';
import { toNullable } from '@dfinity/utils';

export const mockListParams: ListParams = {
	matcher: toNullable(),
	order: toNullable(),
	owner: toNullable(),
	paginate: toNullable()
};

export const mockListProposalsParams: ListProposalsParams = {
	paginate: toNullable(),
	order: toNullable()
};

export const mockListRules: ListRulesParams = {
	matcher: toNullable()
};
