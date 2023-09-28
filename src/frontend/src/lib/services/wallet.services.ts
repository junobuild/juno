import { formatToDate } from '$lib/utils/date.utils';
import { nonNullish } from '$lib/utils/utils';
import {
	transactionAmount,
	transactionFrom,
	transactionMemo,
	transactionTimestamp,
	transactionTo
} from '$lib/utils/wallet.utils';
import type { Principal } from '@dfinity/principal';
import type { TransactionWithId } from '@junobuild/ledger';

type TransactionId = string;
type TransactionTimestamp = string;
type TransactionFrom = string;
type TransactionTo = string;
type TransactionMemo = string;
type TransactionAmount = string;

type TransactionCsv = [
	TransactionId,
	TransactionTimestamp,
	TransactionFrom,
	TransactionTo,
	TransactionMemo,
	TransactionAmount
];

export const exportTransactions = async ({
	missionControlId,
	transactions
}: {
	missionControlId: Principal;
	transactions: TransactionWithId[];
}) => {
	const transactionsCsv: TransactionCsv[] = transactions.map(({ id, transaction }) => {
		const timestamp = transactionTimestamp(transaction);
		const from = transactionFrom(transaction);
		const to = transactionTo(transaction);
		const memo = transactionMemo({ transaction, missionControlId });
		const amount = transactionAmount(transaction);

		return [
			`${id}`,
			nonNullish(timestamp) ? formatToDate(timestamp) : '',
			from,
			to,
			memo,
			amount ?? ''
		];
	});

	const csv = transactionsCsv.map((transaction) => transaction.join(',')).join('\n');


};
