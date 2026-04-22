import type { Nullish } from '@dfinity/zod-schemas';
import { writable, type Readable } from 'svelte/store';

type Data<T> = Nullish<{ data: T }>;

export interface DataStore<T> extends Readable<Data<T>> {
	set: (data: T) => void;
	reset: () => void;
}

export const initDataStore = <T>(): DataStore<T> => {
	const { subscribe, set } = writable<Data<T>>(undefined);

	return {
		subscribe,

		set(data) {
			set({ data });
		},

		reset: () => {
			set(null);
		}
	};
};
