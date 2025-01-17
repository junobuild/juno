import { balanceCertifiedStore } from '$lib/stores/balance.store';
import { exchangePricesCanisterDataStore } from '$lib/stores/exchange.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { transactionsCertifiedStore } from '$lib/stores/transactions.store';
import type {
	PostMessageDataResponseExchange,
	PostMessageDataResponseWallet
} from '$lib/types/post-message';
import { isNullish, jsonReviver } from '@dfinity/utils';
import { get } from 'svelte/store';

export const onSyncWallet = (data: PostMessageDataResponseWallet) => {
	if (isNullish(data.wallet)) {
		return;
	}

	balanceCertifiedStore.set(data.wallet.balance);

	const newTransactions = JSON.parse(data.wallet.newTransactions, jsonReviver);

	transactionsCertifiedStore.prepend(newTransactions);
};

export const onWalletError = ({ error: err }: { error: unknown }) => {
	transactionsCertifiedStore.reset();

	// We get transactions and balance for the same end point therefore if getting certified transactions fails, it also means the balance is incorrect.
	balanceCertifiedStore.reset();

	toasts.error({
		text: get(i18n).errors.wallet_error,
		detail: err
	});
};

export const onWalletCleanUp = ({ transactionIds }: { transactionIds: string[] }) => {
	transactionsCertifiedStore.cleanUp(transactionIds);

	toasts.error({
		text: get(i18n).errors.wallet_uncertified_transactions_removed
	});
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
