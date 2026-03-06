import {
	INDEX_RELOAD_DELAY,
	MEMO_CANISTER_APPROVE,
	MEMO_CANISTER_CREATE,
	MEMO_CMC_MINT_CYCLES,
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
import { uint8ArrayToBigInt, uint8ArrayToHexString } from '@dfinity/utils';
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

	if (memo instanceof Uint8Array) {
		return icrcTransactionMemo({ memo, walletId, from });
	}

	return icpTransactionMemo({ memo, walletId, from });
};

const icpTransactionMemo = ({
	memo,
	walletId,
	from
}: { memo: bigint; walletId: WalletId } & Pick<IcTransactionUi, 'from'>): string => {
	const labels = get(i18n);

	return knownTransactionMemo({
		memo,
		fallback: () => {
			// TODO: likely not performant to encode on each matching transaction...
			const walletIdText = encodeIcrcAccount(walletId);
			const accountIdentifier = toAccountIdentifier(walletId);

			if (from === walletIdText || from === accountIdentifier.toHex()) {
				return labels.wallet.memo_sent;
			}

			return labels.wallet.memo_received;
		}
	});
};

const icrcTransactionMemo = ({
	memo,
	walletId,
	from
}: { memo: Uint8Array; walletId: WalletId } & Pick<IcTransactionUi, 'from'>): string => {
	// Source NNS dapp
	const decodeIcrc1Memo = (): string => {
		try {
			return new TextDecoder('utf-8', { fatal: true }).decode(memo);
		} catch {
			return uint8ArrayToHexString(memo);
		}
	};

	// ICRC memos can be 1–32 bytes, so they may not fit in a u64 (8 bytes).
	// e.g. OpenChat sends 7-byte memos such as 4f435f53454e44 ("OC_SEND").
	if (memo.length !== 8) {
		return decodeIcrc1Memo();
	}

	const encodedMemo = uint8ArrayToBigInt(memo);

	return knownTransactionMemo({
		memo: encodedMemo,
		fallback: decodeIcrc1Memo
	});
};

const knownTransactionMemo = ({
	memo,
	fallback
}: {
	memo: bigint;
	fallback: () => string;
}): string => {
	const labels = get(i18n);

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
		case MEMO_CMC_MINT_CYCLES:
			return labels.wallet.memo_convert_icp_to_cycles;
		default: {
			return fallback();
		}
	}
};
