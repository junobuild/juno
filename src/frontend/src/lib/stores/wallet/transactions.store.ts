import type { LedgerIdText, WalletIdText } from '$lib/schemas/wallet.schema';
import type { CertifiedWalletStoreData } from '$lib/stores/wallet/_wallet.store';
import type { CertifiedTransactions } from '$lib/types/transaction';
import { type Readable, writable } from 'svelte/store';

type CertifiedTransactionsStoreData = CertifiedWalletStoreData<CertifiedTransactions>;

interface CertifiedTransactionsStore extends Readable<CertifiedTransactionsStoreData> {
	prepend: (params: {
		walletId: WalletIdText;
		ledgerId: LedgerIdText;
		transactions: CertifiedTransactions;
	}) => void;
	append: (params: {
		walletId: WalletIdText;
		ledgerId: LedgerIdText;
		transactions: CertifiedTransactions;
	}) => void;
	cleanUp: (params: {
		walletId: WalletIdText;
		ledgerId: LedgerIdText;
		transactionIds: string[];
	}) => void;
	reset: () => void;
}

const initCertifiedTransactionsStore = (): CertifiedTransactionsStore => {
	const { subscribe, update, set } = writable<CertifiedTransactionsStoreData>(undefined);

	return {
		prepend: ({ walletId, ledgerId, transactions }) =>
			update((state) => ({
				...(state ?? {}),
				[walletId]: {
					...(state?.[walletId] ?? {}),
					[ledgerId]: [
						...transactions,
						...((state ?? {})[walletId]?.[ledgerId] ?? []).filter(
							({ data: { id } }) => !transactions.some(({ data: { id: txId } }) => txId === id)
						)
					]
				}
			})),

		append: ({ walletId, ledgerId, transactions }) =>
			update((state) => ({
				...(state ?? {}),
				[walletId]: {
					...(state?.[walletId] ?? {}),
					[ledgerId]: [...((state ?? {})[walletId]?.[ledgerId] ?? []), ...transactions]
				}
			})),

		cleanUp: ({ walletId, ledgerId, transactionIds }) =>
			update((state) => ({
				...(state ?? {}),
				[walletId]: {
					...(state?.[walletId] ?? {}),
					[ledgerId]: ((state ?? {})[walletId]?.[ledgerId] ?? []).filter(
						({ data: { id } }) => !transactionIds.includes(`${id}`)
					)
				}
			})),

		reset: () => {
			set(null);
		},

		subscribe
	};
};

export const transactionsCertifiedStore = initCertifiedTransactionsStore();
