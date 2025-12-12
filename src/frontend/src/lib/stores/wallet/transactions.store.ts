import type { IcrcAccountText } from '$lib/schemas/wallet.schema';
import type { CertifiedWalletStoreData } from '$lib/stores/wallet/_wallet.store';
import type { CertifiedTransactions } from '$lib/types/transaction';
import { type Readable, writable } from 'svelte/store';

type CertifiedTransactionsStoreData = CertifiedWalletStoreData<CertifiedTransactions>;

interface CertifiedTransactionsStore extends Readable<CertifiedTransactionsStoreData> {
	prepend: (params: { account: IcrcAccountText; transactions: CertifiedTransactions }) => void;
	append: (params: { account: IcrcAccountText; transactions: CertifiedTransactions }) => void;
	cleanUp: (params: { account: IcrcAccountText; transactionIds: string[] }) => void;
	reset: () => void;
}

const initCertifiedTransactionsStore = (): CertifiedTransactionsStore => {
	const { subscribe, update, set } = writable<CertifiedTransactionsStoreData>(undefined);

	return {
		prepend: ({ account, transactions }) =>
			update((state) => ({
				...(state ?? {}),
				[account]: [
					...transactions,
					...((state ?? {})[account] ?? []).filter(
						({ data: { id } }) => !transactions.some(({ data: { id: txId } }) => txId === id)
					)
				]
			})),

		append: ({ account, transactions }) =>
			update((state) => ({
				...(state ?? {}),
				[account]: [...((state ?? {})[account] ?? []), ...transactions]
			})),

		cleanUp: ({ account, transactionIds }) =>
			update((state) => ({
				...(state ?? {}),
				[account]: ((state ?? {})[account] ?? []).filter(
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
