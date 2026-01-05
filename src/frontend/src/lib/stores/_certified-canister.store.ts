import type { CanisterStore } from '$lib/stores/_canister.store';
import type { CanisterIdText } from '$lib/types/canister';
import type { CertifiedData } from '$lib/types/store';
import type { Option } from '$lib/types/utils';
import { nonNullish } from '@dfinity/utils';
import { writable, type Readable } from 'svelte/store';

export type CertifiedCanisterStoreData<T> = Option<Record<CanisterIdText, CertifiedData<T> | null>>;

export interface CertifiedCanisterStore<T> extends Readable<CertifiedCanisterStoreData<T>> {
	set: (params: { canisterId: CanisterIdText; data: CertifiedData<T> }) => void;
	setAll: (state: CertifiedCanisterStoreData<T>) => void;
	reset: (canisterId: CanisterIdText) => void;
	resetAll: () => void;
}

export const initCertifiedCanisterStore = <T>(): CertifiedCanisterStore<T> => {
	const { update, subscribe, set } = writable<CertifiedCanisterStoreData<T>>(undefined);

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
export const initPerCertifiedCanisterStore = <T>(): Omit<
	CanisterStore<CertifiedData<T>>,
	'setAll' | 'resetAll'
> => initCertifiedCanisterStore();

// Only bulk independently. This way the subscribers is triggered only when all canisters are loaded.
// Useful to reduce the amount of repaint.
export const initBulkCertifiedCanistersStore = <T>(): Omit<
	CanisterStore<CertifiedData<T>>,
	'set' | 'reset'
> => initCertifiedCanisterStore();
