import { formatToDateNumeric } from '$lib/utils/date.utils';
import { saveToCSVFile } from '$lib/utils/save.utils';
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
			nonNullish(timestamp) ? formatToDateNumeric(timestamp).replace(',', '') : '',
			from,
			to,
			memo,
			amount ?? ''
		];
	});

	const csv = transactionsCsv.map((transaction) => transaction.join(',')).join('\n');

	const date = new Date().toJSON().split('.')[0].replace(/:/g, '-');

	await saveToCSVFile({
		blob: new Blob([csv], {
			type: 'text/csv'
		}),
		filename: `Juno_transactions_${date}.csv`
	});
};
