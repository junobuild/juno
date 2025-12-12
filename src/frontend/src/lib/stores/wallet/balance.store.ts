import type { IcrcAccountText } from '$lib/schemas/wallet.schema';
import type { CertifiedWalletStoreData } from '$lib/stores/wallet/_wallet.store';
import type { CertifiedData } from '$lib/types/store';
import { nonNullish } from '@dfinity/utils';
import { type Readable, writable } from 'svelte/store';

type CertifiedBalanceData = CertifiedData<bigint> | null;

type BalanceStoreData = CertifiedWalletStoreData<CertifiedBalanceData>;

interface BalanceStore extends Readable<BalanceStoreData> {
	set: (params: { account: IcrcAccountText; data: CertifiedBalanceData }) => void;
	setAll: (state: BalanceStoreData) => void;
	reset: (account: IcrcAccountText) => void;
	resetAll: () => void;
}

const initBalanceStore = (): BalanceStore => {
	const { update, subscribe, set } = writable<BalanceStoreData>(undefined);

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

export const balanceCertifiedStore = initBalanceStore();
