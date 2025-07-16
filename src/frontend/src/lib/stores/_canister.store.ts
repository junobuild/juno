import type { CanisterIdText } from '$lib/types/canister';
import type { Option } from '$lib/types/utils';
import { nonNullish } from '@dfinity/utils';
import { writable, type Readable } from 'svelte/store';

export type CanisterStoreData<T> = Option<Record<CanisterIdText, T | null>>;

export interface CanisterStore<T> extends Readable<CanisterStoreData<T>> {
	set: (params: { canisterId: CanisterIdText; data: T }) => void;
	setAll: (state: CanisterStoreData<T>) => void;
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
		setAll: (state) => {
			set(state);
		},
		reset: (canisterId) =>
			update((state) => ({
				...(nonNullish(state) && state),
				[canisterId]: null
			})),
		resetAll: () => set(null)
	};
};

// Each canister is set independently. This way the subscriber is triggered each time a canister changes.
// Useful to update the UI without waiting all canisters data to be loaded.
export const initPerCanisterStore = <T>(): Omit<CanisterStore<T>, 'setAll' | 'resetAll'> =>
	initCanisterStore();

// Only bulk independently. This way the subscribers is triggered only when all canisters are loaded.
// Useful to reduce the amount of repaint.
export const initBulkCanistersStore = <T>(): Omit<CanisterStore<T>, 'set' | 'reset'> =>
	initCanisterStore();
