import type { ListParamsStoreData } from '$lib/stores/data.store';
import type { ListOrder } from '$lib/types/list';

export const DEFAULT_LIST_ORDER: ListOrder = {
	desc: false,
	field: 'keys'
};

export const DEFAULT_LIST_PARAMS: ListParamsStoreData = { order: DEFAULT_LIST_ORDER, filter: {} };

export const DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS = 600_000_000n;
