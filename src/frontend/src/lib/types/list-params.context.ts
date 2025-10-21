import type { Writable } from 'svelte/store';
import type { ListFilter, ListOrder, ListParams } from './list';

export enum LIST_PARAMS_KEY {
	STORAGE = 'STORAGE',
	USERS = 'USERS',
	CDN = 'CDN',
	DOCS = 'DOCS'
}

export type ListParamsData = Pick<ListParams, 'order' | 'filter'>;

export interface ListParamsContext {
	key: LIST_PARAMS_KEY;
	store: Writable<ListParamsData>;
	setOrder: (order: ListOrder) => void;
	setFilter: (filter: ListFilter) => void;
	reload: () => void;
}

export const LIST_PARAMS_CONTEXT_KEY = Symbol('list-params');
