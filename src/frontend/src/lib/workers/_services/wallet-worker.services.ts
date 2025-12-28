import type { QueryAndUpdateRequestParams } from '$lib/api/call/query.api';
import { getIcpTransactions } from '$lib/api/icp-index.api';
import { getIcrcTransactions } from '$lib/api/icrc-index.api';
import { ICP_LEDGER_CANISTER_ID, PAGINATION } from '$lib/constants/app.constants';
import type { IcTransactionUi } from '$lib/types/ic-transaction';
import { mapIcpTransaction } from '$lib/utils/icp-transactions.utils';
import { mapIcrcTransaction } from '$lib/utils/icrc-transactions.utils';
import type { WalletStore } from '$lib/workers/_stores/wallet-worker.store';
import { Principal } from '@icp-sdk/core/principal';

export interface GetTransactionsResponse {
	balance: bigint;
	transactions: IcTransactionUi[];
}

type RequestTransactionsParams = QueryAndUpdateRequestParams & { store: WalletStore };

export const requestTransactions = async ({
	store,
	...rest
}: RequestTransactionsParams): Promise<GetTransactionsResponse> => {
	if (store.ledgerIdText === ICP_LEDGER_CANISTER_ID) {
		return await requestIcpTransactions({ store, ...rest });
	}

	return await requestIcrcTransactions({ store, ...rest });
};

const requestIcpTransactions = async ({
	store,
	identity,
	certified
}: RequestTransactionsParams): Promise<GetTransactionsResponse> => {
	const { transactions: fetchedTransactions, balance } = await getIcpTransactions({
		identity,
		account: store.account,
		// We query tip to discover the new transactions
		start: undefined,
		maxResults: PAGINATION,
		certified
	});

	return {
		balance,
		transactions: fetchedTransactions.map((transaction) =>
			mapIcpTransaction({ transaction, accountIdentifierHex: store.accountIdentifierHex })
		)
	};
};

export const requestIcrcTransactions = async ({
	store,
	identity,
	certified
}: RequestTransactionsParams): Promise<GetTransactionsResponse> => {
	const { transactions: fetchedTransactions, balance } = await getIcrcTransactions({
		identity,
		account: store.account,
		ledgerId: Principal.fromText(store.ledgerIdText),
		// We query tip to discover the new transactions
		start: undefined,
		maxResults: PAGINATION,
		certified
	});

	return {
		balance,
		transactions: fetchedTransactions.map((transaction) =>
			mapIcrcTransaction({ transaction, icrcAccountText: store.icrcAccountText })
		)
	};
};
