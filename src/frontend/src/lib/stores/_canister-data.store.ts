import type { CanisterIdText } from '$lib/types/canister';
import type { Option } from '$lib/types/utils';
import { type Readable, writable } from 'svelte/store';

type CanisterData<T> = Option<Record<CanisterIdText, T | null>>;

export interface CanisterDataStore<T> extends Readable<CanisterData<T>> {
	set: (data: { canisterId: CanisterIdText; data: T }) => void;
	reset: (canisterId: CanisterIdText) => void;
	resetAll: () => void;
}

export const initCanisterDataStore = <T>(): CanisterDataStore<T> => {
	const { subscribe, set, update } = writable<CanisterData<T>>(undefined);

	return {
		subscribe,

		set({ canisterId, data }) {
			update((state) => ({
				...(state ?? {}),
				[canisterId]: data
			}));
		},

		reset: (canisterId) => {
			update((state) => ({
				...(state ?? {}),
				[canisterId]: null
			}));
		},

		resetAll: () => {
			set(null);
		}
	};
};
