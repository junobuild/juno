import { queryAndUpdate, type QueryAndUpdateRequestParams } from '$lib/api/call/query.api';
import { ICP_LEDGER_CANISTER_ID } from '$lib/constants/app.constants';
import type { LedgerIds, WalletId } from '$lib/schemas/wallet.schema';
import {
	requestIcpTransactions,
	requestIcrcTransactions,
	type RequestTransactionsResponse
} from '$lib/services/wallet/wallet.transactions.request.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { transactionsCertifiedStore } from '$lib/stores/wallet/transactions.store';
import type { CertifiedTransactions } from '$lib/types/transaction';
import { formatToDateNumeric } from '$lib/utils/date.utils';
import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';
import { CSV_PICKER_OPTIONS, filenameTimestamp, saveToFileSystem } from '$lib/utils/save.utils';
import { transactionAmount, transactionMemo } from '$lib/utils/wallet.utils';
import { nonNullish } from '@dfinity/utils';
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

export const loadNextTransactions = async ({
	account,
	ledgerId,
	indexId,
	signalEnd,
	...rest
}: {
	account: IcrcAccount;
	start: bigint;
	maxResults?: bigint;
	signalEnd: () => void;
} & LedgerIds): Promise<void> => {
	const request = async (
		params: QueryAndUpdateRequestParams
	): Promise<RequestTransactionsResponse> => {
		if (ledgerId.toText() === ICP_LEDGER_CANISTER_ID) {
			return await requestIcpTransactions({
				account,
				accountIdentifierHex: toAccountIdentifier(account).toHex(),
				...rest,
				...params
			});
		}

		return await requestIcrcTransactions({
			account,
			indexId,
			...rest,
			...params
		});
	};

	return await queryAndUpdate<RequestTransactionsResponse>({
		request,
		onLoad: ({ response: { transactions }, certified }) => {
			if (transactions.length === 0) {
				signalEnd();
				return;
			}

			transactionsCertifiedStore.append({
				walletId: encodeIcrcAccount(account),
				ledgerId: ledgerId.toText(),
				transactions: transactions.map((transaction) => ({
					data: transaction,
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
};
