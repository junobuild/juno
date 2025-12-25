import type { WalletIdText } from '$lib/schemas/wallet.schema';
import type { CertifiedWalletStoreData } from '$lib/stores/wallet/_wallet.store';
import type { CertifiedData } from '$lib/types/store';
import { nonNullish } from '@dfinity/utils';
import { type Readable, writable } from 'svelte/store';

type CertifiedBalanceData = CertifiedData<bigint> | null;

type BalanceStoreData = CertifiedWalletStoreData<CertifiedBalanceData>;

interface BalanceStore extends Readable<BalanceStoreData> {
	set: (params: { walletId: WalletIdText; data: CertifiedBalanceData }) => void;
	setAll: (state: BalanceStoreData) => void;
	reset: (walletId: WalletIdText) => void;
	resetAll: () => void;
}

const initBalanceStore = (): BalanceStore => {
	const { update, subscribe, set } = writable<BalanceStoreData>(undefined);

	return {
		subscribe,
		set({ walletId, data }) {
			update((state) => ({
				...state,
				[walletId]: data
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
