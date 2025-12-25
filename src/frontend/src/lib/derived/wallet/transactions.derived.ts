import { transactionsCertifiedStore } from '$lib/stores/wallet/transactions.store';
import { derived } from 'svelte/store';

export const transactions = derived(
	[transactionsCertifiedStore],
	([$transactionsCertifiedStore]) => $transactionsCertifiedStore ?? {}
);
