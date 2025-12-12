import type { IcrcAccountText } from '$lib/schemas/wallet.schema';
import type { CertifiedData } from '$lib/types/store';
import type { Option } from '$lib/types/utils';
import { nonNullish } from '@dfinity/utils';
import { type Readable, writable } from 'svelte/store';

// TODO: store is similar to initCanisterStore except the type IcrcAccountText vs CanisterIdText and params account vs canisterId
export type BalanceStoreData<T> = Option<Record<IcrcAccountText, T | null>>;

export interface BalanceStore<T> extends Readable<BalanceStoreData<T>> {
	set: (params: { account: IcrcAccountText; data: T }) => void;
	setAll: (state: BalanceStoreData<T>) => void;
	reset: (account: IcrcAccountText) => void;
	resetAll: () => void;
}

export const initBalanceStore = <T>(): BalanceStore<T> => {
	const { update, subscribe, set } = writable<BalanceStoreData<T>>(undefined);

	return {
		subscribe,
		set({ account, data }) {
			update((state) => ({
				...state,
				[account]: data
			}));
		},
		setAll: (state) => {
			set(state);
		},
		reset: (account) =>
			update((state) => ({
				...(nonNullish(state) && state),
				[account]: null
			})),

		resetAll: () => set(null)
	};
};

export const balanceCertifiedStore = initBalanceStore<CertifiedData<bigint>>();
