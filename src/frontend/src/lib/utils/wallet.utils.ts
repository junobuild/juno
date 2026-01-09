import {
	INDEX_RELOAD_DELAY,
	MEMO_CANISTER_APPROVE,
	MEMO_CANISTER_CREATE,
	MEMO_CMC_TOP_UP,
	MEMO_ORBITER_CREATE_REFUND,
	MEMO_SATELLITE_CREATE_REFUND
} from '$lib/constants/wallet.constants';
import type { WalletId } from '$lib/schemas/wallet.schema';
import { i18n } from '$lib/stores/app/i18n.store';
import type { IcTransactionUi } from '$lib/types/ic-transaction';
import { emit } from '$lib/utils/events.utils';
import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';
import { waitForMilliseconds } from '$lib/utils/timeout.utils';
import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
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
	walletId
}: {
	transaction: IcTransactionUi;
	walletId: WalletId;
}): string => {
	const labels = get(i18n);

	const { memo, from } = transaction;

	switch (memo) {
		case MEMO_CANISTER_CREATE:
			return labels.wallet.memo_create;
		case MEMO_CANISTER_APPROVE:
			return labels.wallet.memo_approve;
		case MEMO_SATELLITE_CREATE_REFUND:
			return labels.wallet.memo_refund_satellite;
		case MEMO_ORBITER_CREATE_REFUND:
			return labels.wallet.memo_refund_orbiter;
		case MEMO_CMC_TOP_UP:
			return labels.wallet.memo_refund_top_up;
		default: {
			// TODO: likely not performant to encode on each matching transaction...
			const walletIdText = encodeIcrcAccount(walletId);
			const accountIdentifier = toAccountIdentifier(walletId);

			if (from === walletIdText || from === accountIdentifier.toHex()) {
				return labels.wallet.memo_sent;
			}

			return labels.wallet.memo_received;
		}
	}
};
