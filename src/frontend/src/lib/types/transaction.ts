import type { GetAccountIdentifierTransactionsResponse } from '@junobuild/ledger';

export type JsonTransactionsText = string;

export type PostMessageTransactions = Omit<
	GetAccountIdentifierTransactionsResponse,
	'transactions'
> & { transactions: JsonTransactionsText };
