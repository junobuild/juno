import type { QueryAndUpdateRequestParams } from '$lib/api/call/query.api';
import { getIcpTransactions } from '$lib/api/icp-index.api';
import { getIcrcTransactions } from '$lib/api/icrc-index.api';
import { PAGINATION } from '$lib/constants/app.constants';
import type { LedgerId } from '$lib/schemas/wallet.schema';
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
	identity,
	certified
}: QueryAndUpdateRequestParams & {
	account: IcrcAccount;
	accountIdentifierHex: AccountIdentifierHex;
}): Promise<RequestTransactionsResponse> => {
	const { transactions: fetchedTransactions, balance } = await getIcpTransactions({
		identity,
		account,
		// We query tip to discover the new transactions
		start: undefined,
		maxResults: PAGINATION,
		certified
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
	ledgerId,
	identity,
	certified
}: QueryAndUpdateRequestParams & {
	account: IcrcAccount;
	ledgerId: LedgerId;
}): Promise<RequestTransactionsResponse> => {
	const { transactions: fetchedTransactions, balance } = await getIcrcTransactions({
		identity,
		account,
		ledgerId,
		// We query tip to discover the new transactions
		start: undefined,
		maxResults: PAGINATION,
		certified
	});

	const icrcAccountText = encodeIcrcAccount(account);

	return {
		balance,
		transactions: fetchedTransactions.map((transaction) =>
			mapIcrcTransaction({ transaction, icrcAccountText })
		)
	};
};
