import type { QueryAndUpdateRequestParams } from '$lib/api/call/query.api';
import { getIcpTransactions } from '$lib/api/icp-index.api';
import { getIcrcTransactions } from '$lib/api/icrc-index.api';
import { PAGINATION } from '$lib/constants/app.constants';
import type { IndexId } from '$lib/schemas/wallet.schema';
import type { IcTransactionUi } from '$lib/types/ic-transaction';
import { mapIcpTransaction } from '$lib/utils/icp-transactions.utils';
import { mapIcrcTransaction } from '$lib/utils/icrc-transactions.utils';
import type { AccountIdentifierHex } from '@icp-sdk/canisters/ledger/icp';
import { encodeIcrcAccount, type IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';

export interface RequestTransactionsResponse {
	balance: bigint;
	transactions: IcTransactionUi[];
}

export const requestIcpTransactions = async ({
	account,
	accountIdentifierHex,
	maxResults = PAGINATION,
	...rest
}: QueryAndUpdateRequestParams & {
	account: IcrcAccount;
	accountIdentifierHex: AccountIdentifierHex;
	start: bigint | undefined;
	maxResults?: bigint;
}): Promise<RequestTransactionsResponse> => {
	const { transactions: fetchedTransactions, balance } = await getIcpTransactions({
		account,
		maxResults,
		...rest
	});

	return {
		balance,
		transactions: fetchedTransactions.map((transaction) =>
			mapIcpTransaction({ transaction, accountIdentifierHex })
		)
	};
};

export const requestIcrcTransactions = async ({
	account,
	indexId,
	maxResults = PAGINATION,
	...rest
}: QueryAndUpdateRequestParams & {
	account: IcrcAccount;
	indexId: IndexId;
	start: bigint | undefined;
	maxResults?: bigint;
}): Promise<RequestTransactionsResponse> => {
	const { transactions: fetchedTransactions, balance } = await getIcrcTransactions({
		account,
		indexId,
		maxResults,
		...rest
	});

	const icrcAccountText = encodeIcrcAccount(account);

	return {
		balance,
		transactions: fetchedTransactions.map((transaction) =>
			mapIcrcTransaction({ transaction, icrcAccountText })
		)
	};
};
