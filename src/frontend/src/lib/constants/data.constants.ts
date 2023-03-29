import type { ListParamsStoreData } from '$lib/stores/data.store';
import type { ListOrder } from '$lib/types/list';

export const DEFAULT_LIST_ORDER: ListOrder = {
	desc: false,
	field: 'keys'
};

export const DEFAULT_LIST_PARAMS: ListParamsStoreData = { order: DEFAULT_LIST_ORDER, filter: {} };
