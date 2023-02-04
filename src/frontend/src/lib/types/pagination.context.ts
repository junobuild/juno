import type { Writable } from 'svelte/store';

export interface PaginationStore<T> {
	items?: Array<[string, T]>;
	selectedPage: number;
	pages?: number;
	previousStartAfter?: string;
	startAfter?: string;
}

export interface PaginationContext<T> {
	store: Writable<PaginationStore<T>>;
	resetPage: () => void;
	previousPage: () => void;
	nextPage: () => void;
	setItems: (params: {
		items: [string, T][] | undefined;
		matches_length: bigint | undefined;
	}) => void;
	list: () => Promise<void>;
}

export const PAGINATION_CONTEXT_KEY = Symbol('pagination');
