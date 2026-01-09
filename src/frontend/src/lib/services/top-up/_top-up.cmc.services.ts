import { notifyTopUp } from '$lib/api/cmc.api';
import { MEMO_CMC_TOP_UP } from '$lib/constants/wallet.constants';
import { pollNotifyCmc, sendIcpToCmc } from '$lib/services/cmc.services';
import { i18n } from '$lib/stores/app/i18n.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { i18nFormat } from '$lib/utils/i18n.utils';
import type { TokenAmountV2 } from '@dfinity/utils';
import { ProcessingError } from '@icp-sdk/canisters/cmc';
import type { BlockHeight } from '@icp-sdk/canisters/ledger/icp';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

interface TopUpWithCmcParams {
	canisterId: Principal;
	identity: OptionIdentity;
	tokenAmount: TokenAmountV2;
}

export const topUpWithCmc = async ({
	canisterId,
	identity,
	...rest
}: TopUpWithCmcParams): Promise<void> => {
	const blockHeight = await sendIcpToCmc({
		canisterId,
		identity,
		memo: MEMO_CMC_TOP_UP,
		...rest
	});

	const callNotify = async () =>
		await callNotifyTopUp({
			blockHeight,
			canisterId,
			identity
		});

	const result = await pollNotifyCmc({ callNotify });

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

		return { result: 'error', err };
	}
};
