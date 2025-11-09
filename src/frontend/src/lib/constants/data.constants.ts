import type { ListOrder, ListRulesParams } from '$lib/types/list';
import type { ListParamsData } from '$lib/types/list-params.context';

export const DEFAULT_LIST_ORDER: ListOrder = {
	desc: false,
	field: 'keys'
};

export const DEFAULT_LIST_PARAMS: ListParamsData = { order: DEFAULT_LIST_ORDER, filter: {} };

export const DEFAULT_LIST_RULES_PARAMS: ListRulesParams = { includeSystem: false };

export const DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS = 600_000_000n;
