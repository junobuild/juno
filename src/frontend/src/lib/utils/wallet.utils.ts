import { getAccountIdentifier } from '$lib/api/icp-index.api';
import {
	MEMO_CANISTER_CREATE,
	MEMO_CANISTER_TOP_UP,
	MEMO_ORBITER_CREATE_REFUND,
	MEMO_SATELLITE_CREATE_REFUND
} from '$lib/constants/wallet.constants';
import { i18n } from '$lib/stores/i18n.store';
import type { IcTransactionUi } from '$lib/types/ic-transaction';
import type { MissionControlId } from '$lib/types/mission-control';
import { formatICP } from '$lib/utils/icp.utils';
import { nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const transactionMemo = ({
	transaction,
	missionControlId
}: {
	transaction: IcTransactionUi;
	missionControlId: MissionControlId;
}): string => {
	const labels = get(i18n);

	const { memo, from } = transaction;

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

export const transactionAmount = (transaction: IcTransactionUi): string | undefined =>
	nonNullish(transaction.value) ? formatICP(transaction.value) : undefined;
