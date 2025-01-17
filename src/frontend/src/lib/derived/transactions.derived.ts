import { transactionsCertifiedStore } from '$lib/stores/transactions.store';
import { derived } from 'svelte/store';

export const transactions = derived(
	[transactionsCertifiedStore],
	([$transactionsCertifiedStore]) => $transactionsCertifiedStore ?? []
);
