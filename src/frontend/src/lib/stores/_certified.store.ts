import type { CertifiedData } from '$lib/types/store';
import type { Option } from '$lib/types/utils';
import { writable, type Readable } from 'svelte/store';

type CertifiedStoreData<T> = Option<CertifiedData<T>>;

export interface CertifiedStore<T> extends Readable<CertifiedStoreData<T>> {
	set: (data: CertifiedData<T>) => void;
	reset: () => void;
}

export const initCertifiedStore = <T>(): CertifiedStore<T> => {
	const { subscribe, set } = writable<CertifiedStoreData<T>>(undefined);

	return {
		subscribe,

		set(data) {
			set(data);
		},

		reset: () => {
			set(null);
		}
	};
};
