import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { balanceCertifiedStore } from '$lib/stores/wallet/balance.store';
import { exchangePricesCanisterDataStore } from '$lib/stores/wallet/exchange.store';
import { transactionsCertifiedStore } from '$lib/stores/wallet/transactions.store';
import type {
	PostMessageDataResponseExchange,
	PostMessageDataResponseWallet,
	PostMessageDataResponseWalletCleanUp
} from '$lib/types/post-message';
import { isNullish, jsonReviver } from '@dfinity/utils';
import { get } from 'svelte/store';

export const onSyncWallet = (data: PostMessageDataResponseWallet) => {
	if (isNullish(data.wallet)) {
		return;
	}

	const {
		wallet: { account, newTransactions, balance }
	} = data;

	balanceCertifiedStore.set({
		account,
		data: balance
	});

	const transactions = JSON.parse(newTransactions, jsonReviver);

	transactionsCertifiedStore.prepend({
		account,
		transactions
	});
};

export const onWalletError = ({ error: err }: { error: unknown }) => {
	transactionsCertifiedStore.reset();

	// We get transactions and balance for the same end point therefore if getting certified transactions fails, it also means the balance is incorrect.
	balanceCertifiedStore.resetAll();

	toasts.error({
		text: get(i18n).errors.wallet_error,
		detail: err
	});
};

export const onWalletCleanUp = ({
	transactionIds,
	account
}: PostMessageDataResponseWalletCleanUp) => {
	transactionsCertifiedStore.cleanUp({ account, transactionIds });

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
