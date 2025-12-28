import type { QueryAndUpdateRequestParams } from '$lib/api/call/query.api';
import { getTransactions } from '$lib/api/icp-index.api';
import { PAGINATION } from '$lib/constants/app.constants';
import type { IcTransactionUi } from '$lib/types/ic-transaction';
import { mapIcpTransaction } from '$lib/utils/icp-transactions.utils';
import type { WalletStore } from '$lib/workers/_stores/wallet-worker.store';

export interface GetTransactionsResponse {
	balance: bigint;
	transactions: IcTransactionUi[];
}

export const requestIcpTransactions = async ({
	store,
	identity,
	certified
}: QueryAndUpdateRequestParams & { store: WalletStore }): Promise<GetTransactionsResponse> => {
	const { transactions: fetchedTransactions, balance } = await getTransactions({
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
