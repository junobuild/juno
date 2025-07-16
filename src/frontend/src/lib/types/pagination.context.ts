import type { Readable, Writable } from 'svelte/store';

export interface PaginationData<T> {
	items?: Array<[string, T]>;
	selectedPage: number;
	pages?: number;
	startAfters?: string[];
	itemsLength?: number;
	matchesLength?: number;
}

export interface PaginationContext<T> {
	store: Writable<PaginationData<T>>;
	resetPage: () => void;
	previousPage: () => void;
	nextPage: () => void;
	setItems: (params: {
		items: [string, T][] | undefined;
		matches_length: bigint | undefined;
		items_length: bigint | undefined;
	}) => void;
	setItem: (item: [string, T]) => void;
	list: () => Promise<void>;
	startAfter: Readable<string | undefined>;
}

export const PAGINATION_CONTEXT_KEY = Symbol('pagination');
