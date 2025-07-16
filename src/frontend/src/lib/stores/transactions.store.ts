import type { CertifiedTransactions } from '$lib/types/transaction';
import type { Option } from '$lib/types/utils';
import { type Readable, writable } from 'svelte/store';

type CertifiedTransactionsStoreData = Option<CertifiedTransactions>;

interface CertifiedTransactionsStore extends Readable<CertifiedTransactionsStoreData> {
	prepend: (transactions: CertifiedTransactions) => void;
	append: (transactions: CertifiedTransactions) => void;
	cleanUp: (transactionIds: string[]) => void;
	reset: () => void;
}

const initCertifiedTransactionsStore = (): CertifiedTransactionsStore => {
	const { subscribe, update, set } = writable<CertifiedTransactionsStoreData>(undefined);

	return {
		prepend: (transactions) =>
			update((state) => [
				...transactions,
				...(state ?? []).filter(
					({ data: { id } }) => !transactions.some(({ data: { id: txId } }) => txId === id)
				)
			]),

		append: (transactions) => update((state) => [...(state ?? []), ...transactions]),

		cleanUp: (transactionIds) =>
			update((state) =>
				(state ?? []).filter(({ data: { id } }) => !transactionIds.includes(`${id}`))
			),

		reset: () => {
			set(null);
		},

		subscribe
	};
};

export const transactionsCertifiedStore = initCertifiedTransactionsStore();
