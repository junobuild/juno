import { icpTransfer as icpTransferWithDev } from '$lib/api/icp-ledger.api';
import { CMC_CANISTER_ID } from '$lib/constants/app.constants';
import { ICP_TOP_UP_FEE, ICP_TRANSACTION_FEE } from '$lib/constants/token.constants';
import type { OptionIdentity } from '$lib/types/itentity';
import { nowInBigIntNanoSeconds } from '$lib/utils/date.utils';
import { waitForMilliseconds } from '$lib/utils/timeout.utils';
import { principalToSubAccount, type TokenAmountV2 } from '@dfinity/utils';
import {
	AccountIdentifier,
	type BlockHeight,
	SubAccount,
	type TransferRequest
} from '@icp-sdk/canisters/ledger/icp';
import { Principal } from '@icp-sdk/core/principal';

interface SendIcpToCmcParams {
	subAccount: Principal;
	identity: OptionIdentity;
	tokenAmount: TokenAmountV2;
	memo: bigint;
}

export const sendIcpToCmc = async ({
	subAccount,
	tokenAmount,
	memo,
	...rest
}: SendIcpToCmcParams): Promise<BlockHeight> => {
	const toSubAccount = principalToSubAccount(subAccount);

	const to = AccountIdentifier.fromPrincipal({
		principal: Principal.fromText(CMC_CANISTER_ID),
		subAccount: SubAccount.fromBytes(toSubAccount)
	});

	// We need to hold back 1 transaction fee for the 'send' and also 1 for the 'notify'
	const sendAmount = tokenAmount.toE8s() - ICP_TOP_UP_FEE;

	const request: TransferRequest = {
		to,
		amount: sendAmount,
		fee: ICP_TRANSACTION_FEE,
		createdAt: nowInBigIntNanoSeconds(),
		memo
	};

	return await icpTransferWithDev({
		request,
		...rest
	});
};

export type CallNotifyResult =
	| { result: 'success' }
	| { result: 'processing_error' }
	| { result: 'error'; err: unknown };

export const pollNotifyCmc = async ({
	// 15 tries with a delay of 1_000ms each = max 10 seconds
	retries = 15,
	intervalInMs = 1_000,
	callNotify
}: {
	retries?: number;
	intervalInMs?: number;
	callNotify: () => Promise<CallNotifyResult>;
}): Promise<{ result: 'success' } | { result: 'timeout' } | { result: 'error'; err: unknown }> => {
	const result = await callNotify();

	if (result.result !== 'processing_error') {
		return result;
	}

	const remainingRetries = retries - 1;

	if (remainingRetries === 0) {
		return { result: 'timeout' };
	}

	await waitForMilliseconds(intervalInMs);

	return pollNotifyCmc({ retries: remainingRetries, intervalInMs, callNotify });
};
