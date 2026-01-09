import { notifyMintCycles } from '$lib/api/cmc.api';
import { pollNotifyCmc } from '$lib/services/cmc.services';
import { i18n } from '$lib/stores/app/i18n.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { i18nFormat } from '$lib/utils/i18n.utils';
import { toNullable } from '@dfinity/utils';
import { ProcessingError } from '@icp-sdk/canisters/cmc';
import { get } from 'svelte/store';

interface ConvertIcpWithCmcParams {
	identity: OptionIdentity;
	blockHeight: bigint;
}

export const convertIcpWithCmc = async ({
	identity,
	blockHeight
}: ConvertIcpWithCmcParams): Promise<void> => {
	const callNotify = async () =>
		await callNotifyMint({
			blockHeight,
			identity
		});

	const result = await pollNotifyCmc({ callNotify });

	if (result.result === 'timeout') {
		throw new Error(
			i18nFormat(get(i18n).errors.convert_icp_to_cycles_timeout, [
				{
					placeholder: '{0}',
					value: `${blockHeight}`
				}
			])
		);
	}

	if (result.result === 'error') {
		throw result.err;
	}
};

const callNotifyMint = async ({
	blockHeight: block_index,
	identity
}: Omit<ConvertIcpWithCmcParams, 'tokenAmount'>): Promise<
	{ result: 'success' } | { result: 'processing_error' } | { result: 'error'; err: unknown }
> => {
	try {
		await notifyMintCycles({
			identity,
			request: {
				block_index,
				deposit_memo: toNullable(),
				to_subaccount: toNullable()
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
