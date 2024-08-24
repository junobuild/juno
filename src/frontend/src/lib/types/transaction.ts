import type { GetAccountIdentifierTransactionsResponse } from '@dfinity/ledger-icp';

export type JsonTransactionsText = string;

export type Wallet = Omit<GetAccountIdentifierTransactionsResponse, 'transactions'> & {
	newTransactions: JsonTransactionsText;
};
