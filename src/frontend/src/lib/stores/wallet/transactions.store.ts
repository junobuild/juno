import type { WalletId } from '$lib/schemas/wallet.schema';
import type { CertifiedWalletStoreData } from '$lib/stores/wallet/_wallet.store';
import type { CertifiedTransactions } from '$lib/types/transaction';
import { type Readable, writable } from 'svelte/store';

type CertifiedTransactionsStoreData = CertifiedWalletStoreData<CertifiedTransactions>;

interface CertifiedTransactionsStore extends Readable<CertifiedTransactionsStoreData> {
	prepend: (params: { walletId: WalletId; transactions: CertifiedTransactions }) => void;
	append: (params: { walletId: WalletId; transactions: CertifiedTransactions }) => void;
	cleanUp: (params: { walletId: WalletId; transactionIds: string[] }) => void;
	reset: () => void;
}

const initCertifiedTransactionsStore = (): CertifiedTransactionsStore => {
	const { subscribe, update, set } = writable<CertifiedTransactionsStoreData>(undefined);

	return {
		prepend: ({ walletId, transactions }) =>
			update((state) => ({
				...(state ?? {}),
				[walletId]: [
					...transactions,
					...((state ?? {})[walletId] ?? []).filter(
						({ data: { id } }) => !transactions.some(({ data: { id: txId } }) => txId === id)
					)
				]
			})),

		append: ({ walletId, transactions }) =>
			update((state) => ({
				...(state ?? {}),
				[walletId]: [...((state ?? {})[walletId] ?? []), ...transactions]
			})),

		cleanUp: ({ walletId, transactionIds }) =>
			update((state) => ({
				...(state ?? {}),
				[walletId]: ((state ?? {})[walletId] ?? []).filter(
					({ data: { id } }) => !transactionIds.includes(`${id}`)
				)
			})),

		reset: () => {
			set(null);
		},

		subscribe
	};
};

export const transactionsCertifiedStore = initCertifiedTransactionsStore();
