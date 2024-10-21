import type { Option } from '$lib/types/utils';
import type { Writable } from 'svelte/store';

export interface DataStore<T> {
	key: string | undefined;
	data: T | undefined;
}

export type DataStoreData<T> = Option<DataStore<T>>;

export interface DataContext<T> {
	store: Writable<DataStoreData<T>>;
	resetData: () => void;
}

export const DATA_CONTEXT_KEY = Symbol('data');
