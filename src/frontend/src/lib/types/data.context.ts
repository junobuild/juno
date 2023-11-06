import type { Writable } from 'svelte/store';

export enum DataStoreAction {
	CREATE,
	EDIT,
	VIEW
}

export interface DataStore<T> {
	key: string | undefined;
	data: T | undefined;
	action?: DataStoreAction;
}

export interface DataContext<T> {
	store: Writable<DataStore<T>>;
	resetData: () => void;
}

export const DATA_CONTEXT_KEY = Symbol('data');
