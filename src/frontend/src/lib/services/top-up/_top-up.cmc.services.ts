import { notifyTopUp } from '$lib/api/cmc.api';
import { icpTransfer as icpTransferWithDev } from '$lib/api/icp-ledger.api';
import { CMC_CANISTER_ID, TOP_UP_NETWORK_FEES } from '$lib/constants/app.constants';
import { MEMO_CANISTER_TOP_UP } from '$lib/constants/wallet.constants';
import { i18n } from '$lib/stores/app/i18n.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { nowInBigIntNanoSeconds } from '$lib/utils/date.utils';
import { i18nFormat } from '$lib/utils/i18n.utils';
import { waitForMilliseconds } from '$lib/utils/timeout.utils';
import { principalToSubAccount, TokenAmountV2 } from '@dfinity/utils';
import { ProcessingError } from '@icp-sdk/canisters/cmc';
import {
	AccountIdentifier,
	SubAccount,
	type BlockHeight,
	type TransferRequest
} from '@icp-sdk/canisters/ledger/icp';
import { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

type TopUpWithCmcParams = {
	canisterId: Principal;
	identity: OptionIdentity;
	tokenAmount: TokenAmountV2;
};

export const topUpWithCmc = async ({
	canisterId,
	identity,
	...rest
}: TopUpWithCmcParams): Promise<void> => {
	const blockHeight = await sendIcpToCmc({
		canisterId,
		identity,
		...rest
	});

	const result = await pollNotifyTopUp({ blockHeight, canisterId, identity });

	if (result.result === 'timeout') {
		throw new Error(
			i18nFormat(get(i18n).errors.top_up_timeout, [
				{
					placeholder: '{0}',
					value: `${blockHeight}`
				},
				{
					placeholder: '{1}',
					value: canisterId.toText()
				}
			])
		);
	}

	if (result.result === 'error') {
		throw result.err;
	}
};

export const sendIcpToCmc = async ({
	canisterId,
	tokenAmount,
	...rest
}: TopUpWithCmcParams): Promise<BlockHeight> => {
	const toSubAccount = principalToSubAccount(canisterId);

	const to = AccountIdentifier.fromPrincipal({
		principal: Principal.fromText(CMC_CANISTER_ID),
		subAccount: SubAccount.fromBytes(toSubAccount)
	});

	const request: TransferRequest = {
		to,
		amount: tokenAmount.toE8s(),
		fee: TOP_UP_NETWORK_FEES,
		createdAt: nowInBigIntNanoSeconds(),
		memo: MEMO_CANISTER_TOP_UP
	};


	return await icpTransferWithDev({
		request,
		...rest
	});
};

const callNotifyTopUp = async ({
	blockHeight: block_index,
	identity,
	canisterId: canister_id
}: Omit<TopUpWithCmcParams, 'tokenAmount'> & {
	blockHeight: BlockHeight;
}): Promise<
	{ result: 'success' } | { result: 'processing_error' } | { result: 'error'; err: unknown }
> => {
	try {
		await notifyTopUp({
			identity,
			request: {
				canister_id,
				block_index
			}
		});

		return { result: 'success' };
	} catch (err: unknown) {
		if (err instanceof ProcessingError) {
			return { result: 'processing_error' };
		}

		return { result: 'error', err: err };
	}
};

const pollNotifyTopUp = async ({
	// 15 tries with a delay of 1_000ms each = max 10 seconds
	retries = 15,
	intervalInMs = 1_000,
	...rest
}: Omit<TopUpWithCmcParams, 'tokenAmount'> & {
	blockHeight: BlockHeight;
} & {
	retries?: number;
	intervalInMs?: number;
}): Promise<{ result: 'success' } | { result: 'timeout' } | { result: 'error'; err: unknown }> => {
	const result = await callNotifyTopUp(rest);

	if (result.result !== 'processing_error') {
		return result;
	}

	const remainingRetries = retries - 1;

	if (remainingRetries === 0) {
		return { result: 'timeout' };
	}

	await waitForMilliseconds(intervalInMs);

	return pollNotifyTopUp({ retries: remainingRetries, intervalInMs, ...rest });
};
