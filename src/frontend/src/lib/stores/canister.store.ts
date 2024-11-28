import type { CanisterIdText } from '$lib/types/canister';
import { nonNullish } from '@dfinity/utils';
import { writable, type Readable } from 'svelte/store';

export type CanisterStoreData<T> = Record<CanisterIdText, T | null> | undefined | null;

export interface CanisterStore<T> extends Readable<CanisterStoreData<T>> {
	set: (params: { canisterId: CanisterIdText; data: T }) => void;
	reset: (canisterId: CanisterIdText) => void;
	resetAll: () => void;
}

export const initCanisterStore = <T>(): CanisterStore<T> => {
	const { update, subscribe, set } = writable<CanisterStoreData<T>>(undefined);

	return {
		subscribe,
		set({ canisterId, data }) {
			update((state) => ({
				...state,
				[canisterId]: data
			}));
		},
		reset: (canisterId) =>
			update((state) => ({
				...(nonNullish(state) && state),
				[canisterId]: null
			})),
		resetAll: () => set(null)
	};
};
