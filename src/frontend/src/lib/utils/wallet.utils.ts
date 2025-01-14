import { getAccountIdentifier } from '$lib/api/icp-index.api';
import {
	MEMO_CANISTER_CREATE,
	MEMO_CANISTER_TOP_UP,
	MEMO_ORBITER_CREATE_REFUND,
	MEMO_SATELLITE_CREATE_REFUND
} from '$lib/constants/wallet.constants';
import { i18n } from '$lib/stores/i18n.store';
import { formatICP } from '$lib/utils/icp.utils';
import type { Transaction } from '@dfinity/ledger-icp';
import type { Principal } from '@dfinity/principal';
import { fromNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

export const transactionTimestamp = (transaction: Transaction): bigint | undefined =>
	fromNullable(transaction.timestamp)?.timestamp_nanos;

export const transactionFrom = (transaction: Transaction): string =>
	'Transfer' in transaction.operation ? transaction.operation.Transfer.from : '';

export const transactionTo = (transaction: Transaction): string =>
	'Transfer' in transaction.operation ? transaction.operation.Transfer.to : '';

export const transactionMemo = ({
	transaction,
	missionControlId
}: {
	transaction: Transaction;
	missionControlId: Principal;
}): string => {
	const labels = get(i18n);

	const from = transactionFrom(transaction);
	const { memo } = transaction;

	switch (memo) {
		case MEMO_CANISTER_CREATE:
			return labels.wallet.memo_create;
		case MEMO_SATELLITE_CREATE_REFUND:
			return labels.wallet.memo_refund_satellite;
		case MEMO_ORBITER_CREATE_REFUND:
			return labels.wallet.memo_refund_orbiter;
		case MEMO_CANISTER_TOP_UP:
			return labels.wallet.memo_refund_top_up;
		default: {
			const accountIdentifier = getAccountIdentifier(missionControlId);

			if (from === missionControlId.toText() || from === accountIdentifier.toHex()) {
				return labels.wallet.memo_sent;
			}

			return labels.wallet.memo_received;
		}
	}
};

export const transactionAmount = (transaction: Transaction): string | undefined =>
	'Transfer' in transaction.operation
		? formatICP(transaction.operation.Transfer.amount.e8s)
		: undefined;
