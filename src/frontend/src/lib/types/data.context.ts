import type { Nullish } from '@dfinity/zod-schemas';
import type { Writable } from 'svelte/store';

export interface DataStore<T> {
	key: string | undefined;
	data: T | undefined;
}

export type DataStoreData<T> = Nullish<DataStore<T>>;

export interface DataContext<T> {
	store: Writable<DataStoreData<T>>;
	resetData: () => void;
}

export const DATA_CONTEXT_KEY = Symbol('data');
