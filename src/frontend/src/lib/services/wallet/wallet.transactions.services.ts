import { queryAndUpdate } from '$lib/api/call/query.api';
import { getTransactions } from '$lib/api/icp-index.api';
import type { WalletId } from '$lib/schemas/wallet.schema';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { transactionsCertifiedStore } from '$lib/stores/wallet/transactions.store';
import type { CertifiedTransactions } from '$lib/types/transaction';
import { formatToDateNumeric } from '$lib/utils/date.utils';
import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';
import { mapIcpTransaction } from '$lib/utils/icp-transactions.utils';
import { CSV_PICKER_OPTIONS, filenameTimestamp, saveToFileSystem } from '$lib/utils/save.utils';
import { transactionAmount, transactionMemo } from '$lib/utils/wallet.utils';
import { nonNullish } from '@dfinity/utils';
import type { IcpIndexDid } from '@icp-sdk/canisters/ledger/icp';
import { encodeIcrcAccount, type IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
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
	walletId,
	transactions
}: {
	walletId: WalletId;
	transactions: CertifiedTransactions;
}) => {
	const transactionsCsv: TransactionCsv[] = transactions.map(({ data: transaction }) => {
		const { id, timestamp, from, to } = transaction;
		const memo = transactionMemo({ transaction, walletId });
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
	account,
	signalEnd,
	...rest
}: {
	account: IcrcAccount;
	start?: bigint;
	maxResults?: bigint;
	signalEnd: () => void;
}): Promise<void> =>
	queryAndUpdate<IcpIndexDid.GetAccountIdentifierTransactionsResponse>({
		request: (params) =>
			getTransactions({
				account,
				...rest,
				...params
			}),
		onLoad: ({ response: { transactions }, certified }) => {
			if (transactions.length === 0) {
				signalEnd();
				return;
			}

			transactionsCertifiedStore.append({
				walletId: encodeIcrcAccount(account),
				transactions: transactions.map((transaction) => ({
					data: mapIcpTransaction({
						transaction,
						accountIdentifierHex: toAccountIdentifier(account).toHex()
					}),
					certified
				}))
			});
		},
		onCertifiedError: ({ error }) => {
			toasts.error({
				text: get(i18n).errors.transactions_next,
				detail: error
			});

			signalEnd();
		},
		identity: new AnonymousIdentity()
	});
