import { getAccountIdentifier } from '$lib/api/icp-index.api';
import {
	INDEX_RELOAD_DELAY,
	MEMO_CANISTER_CREATE,
	MEMO_CANISTER_TOP_UP,
	MEMO_ORBITER_CREATE_REFUND,
	MEMO_SATELLITE_CREATE_REFUND
} from '$lib/constants/wallet.constants';
import { i18n } from '$lib/stores/i18n.store';
import type { IcTransactionUi } from '$lib/types/ic-transaction';
import type { MissionControlId } from '$lib/types/mission-control';
import { emit } from '$lib/utils/events.utils';
import { formatICP } from '$lib/utils/icp.utils';
import { waitForMilliseconds } from '$lib/utils/timeout.utils';
import { nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

/**
 * Wait few seconds and trigger the wallet to fetch optimistically new transactions twice.
 */
export const waitAndRestartWallet = async () => {
	await waitForMilliseconds(INDEX_RELOAD_DELAY);

	// Best case scenario, the transaction has already been noticed by the index canister after INDEX_RELOAD_DELAY seconds.
	emit({ message: 'junoRestartWallet' });

	// In case the best case scenario was not met, we optimistically try to retrieve the transactions on more time given that we generally retrieve transactions every WALLET_TIMER_INTERVAL_MILLIS seconds without blocking the UI.
	waitForMilliseconds(INDEX_RELOAD_DELAY).then(() => emit({ message: 'junoRestartWallet' }));
};

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
