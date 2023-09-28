import type { GetAccountIdentifierTransactionsResponse } from '@junobuild/ledger';

export type JsonTransactionsText = string;

export type Wallet = Omit<
	GetAccountIdentifierTransactionsResponse,
	'transactions'
> & { transactions: JsonTransactionsText };
