import { queryAndUpdate } from '$lib/api/call/query.api';
import { getTransactions } from '$lib/api/icp-index.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { transactionsCertifiedStore } from '$lib/stores/transactions.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { CertifiedTransactions } from '$lib/types/transaction';
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
	missionControlId: MissionControlId;
	transactions: CertifiedTransactions;
}) => {
	const transactionsCsv: TransactionCsv[] = transactions.map(({ data: transaction }) => {
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
	...rest
}: {
	owner: Principal;
	identity: OptionIdentity;
	start?: bigint;
	maxResults?: bigint;
	signalEnd: () => void;
}): Promise<void> =>
	queryAndUpdate<GetAccountIdentifierTransactionsResponse>({
		request: (params) =>
			getTransactions({
				...rest,
				...params
			}),
		onLoad: ({ response: { transactions }, certified }) => {
			if (transactions.length === 0) {
				signalEnd();
				return;
			}

			transactionsCertifiedStore.append(
				transactions.map((transaction) => ({
					data: mapIcpTransaction({
						transaction,
						identity
					}),
					certified
				}))
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
