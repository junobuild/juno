import { balanceCertifiedStore } from '$lib/stores/balance.store';
import { exchangePricesCanisterDataStore } from '$lib/stores/exchange.store';
import { transactionsCertifiedStore } from '$lib/stores/transactions.store';
import type {
	PostMessageDataResponseExchange,
	PostMessageDataResponseWallet
} from '$lib/types/post-message';
import { isNullish, jsonReviver } from '@dfinity/utils';

export const onSyncWallet = (data: PostMessageDataResponseWallet) => {
	if (isNullish(data.wallet)) {
		return;
	}

	balanceCertifiedStore.set(data.wallet.balance);

	const newTransactions = JSON.parse(data.wallet.newTransactions, jsonReviver);

	transactionsCertifiedStore.prepend(newTransactions);
};

export const onSyncExchange = (data: PostMessageDataResponseExchange) => {
	if (isNullish(data.exchange)) {
		return;
	}

	const { exchange } = data;

	const entries = Object.entries(exchange);

	for (const [canisterId, data] of entries) {
		if (isNullish(data)) {
			exchangePricesCanisterDataStore.reset(canisterId);
		} else {
			exchangePricesCanisterDataStore.set({ canisterId, data });
		}
	}
};
