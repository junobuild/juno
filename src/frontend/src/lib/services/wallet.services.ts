import { queryAndUpdate } from '$lib/api/call/query.api';
import { getTransactions } from '$lib/api/icp-index.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { IcTransactionUi } from '$lib/types/ic-transaction';
import type { OptionIdentity } from '$lib/types/itentity';
import { formatToDateNumeric } from '$lib/utils/date.utils';
import { mapIcpTransaction } from '$lib/utils/icp-transactions.utils';
import { CSV_PICKER_OPTIONS, filenameTimestamp, saveToFileSystem } from '$lib/utils/save.utils';
import { transactionAmount, transactionMemo } from '$lib/utils/wallet.utils';
import type { GetAccountIdentifierTransactionsResponse } from '@dfinity/ledger-icp';
import type { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

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
	transactions: IcTransactionUi[];
}) => {
	const transactionsCsv: TransactionCsv[] = transactions.map((transaction) => {
		const { id, timestamp, from, to } = transaction;
		const memo = transactionMemo({ transaction, missionControlId });
		const amount = transactionAmount(transaction);

		return [
			`${id}`,
			nonNullish(timestamp) ? formatToDateNumeric(timestamp).replace(',', '') : '',
			from ?? '',
			to ?? '',
			memo,
			amount ?? ''
		];
	});

	const csv = transactionsCsv.map((transaction) => transaction.join(',')).join('\n');

	await saveToFileSystem({
		blob: new Blob([csv], {
			type: 'text/csv'
		}),
		type: CSV_PICKER_OPTIONS,
		filename: `Juno_Mission_Control_Transactions_${filenameTimestamp()}.csv`
	});
};

export const loadNextTransactions = ({
	identity,
	signalEnd,
	loadTransactions,
	...rest
}: {
	owner: Principal;
	identity: OptionIdentity;
	start?: bigint;
	maxResults?: bigint;
	signalEnd: () => void;
	loadTransactions: (transaction: IcTransactionUi[]) => void;
}): Promise<void> =>
	queryAndUpdate<GetAccountIdentifierTransactionsResponse>({
		request: (params) =>
			getTransactions({
				...rest,
				...params
			}),
		onLoad: ({ response: { transactions }, certified: _ }) => {
			if (transactions.length === 0) {
				signalEnd();
				return;
			}

			loadTransactions(
				transactions.map((transaction) =>
					mapIcpTransaction({
						transaction,
						identity
					})
				)
			);
		},
		onCertifiedError: ({ error }) => {
			toasts.error({
				text: get(i18n).errors.transactions_next,
				detail: error
			});

			signalEnd();
		},
		identity
	});
