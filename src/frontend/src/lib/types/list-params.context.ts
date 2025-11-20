import type { Readable } from 'svelte/store';
import type { ListFilter, ListOrder, ListParams } from './list';

export enum ListParamsKey {
	STORAGE = 'storage',
	USERS = 'users',
	CDN = 'cdn',
	DOCS = 'docs'
}

export type ListParamsData = Pick<ListParams, 'order' | 'filter'>;

export interface ListParamsContext {
	key: ListParamsKey;
	listParams: Readable<ListParamsData>;
	setOrder: (order: ListOrder) => void;
	setFilter: (filter: ListFilter) => void;
	reload: () => void;
}

export const LIST_PARAMS_CONTEXT_KEY = Symbol('list-params');
