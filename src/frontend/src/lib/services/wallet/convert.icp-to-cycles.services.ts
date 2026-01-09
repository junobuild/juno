import { ICP } from '$lib/constants/token.constants';
import { MEMO_CMC_MINT_CYCLES } from '$lib/constants/wallet.constants';
import type { SelectedWallet } from '$lib/schemas/wallet.schema';
import { execute } from '$lib/services/_progress.services';
import { sendIcpToCmc } from '$lib/services/cmc.services';
import { convertIcpWithCmc } from '$lib/services/wallet/_convert.cmc.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { type ConvertIcpProgress, ConvertIcpProgressStep } from '$lib/types/progress-convert-icp';
import { assertAndConvertAmountToToken } from '$lib/utils/token.utils';
import { waitAndRestartWallet } from '$lib/utils/wallet.utils';
import { assertNonNullish, isEmptyString, isNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const convertIcpToCycles = async ({
	identity,
	selectedWallet,
	balance,
	amount,
	onProgress
}: {
	identity: OptionIdentity;
	selectedWallet: SelectedWallet;
	balance: bigint;
	amount: string | undefined;
	onProgress: (progress: ConvertIcpProgress | undefined) => void;
}): Promise<{ success: 'ok' | 'error'; err?: unknown }> => {
	if (isEmptyString(amount)) {
		toasts.error({
			text: get(i18n).errors.invalid_amount_to_convert_icp_to_cycles
		});
		return { success: 'error' };
	}

	const { valid, tokenAmount } = assertAndConvertAmountToToken({
		balance,
		amount,
		token: ICP.token,
		fee: ICP.fees.topUp
	});

	if (!valid || isNullish(tokenAmount)) {
		return { success: 'error' };
	}

	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const { type: walletType, walletId } = selectedWallet;

		// Transfer ICP
		const send = async () => {
			return await sendIcpToCmc({
				subAccount: identity.getPrincipal(),
				identity,
				memo: MEMO_CMC_MINT_CYCLES,
				tokenAmount
			});
		};
		const blockHeight = await execute({
			fn: send,
			onProgress,
			step: ConvertIcpProgressStep.Transfer
		});

		// Notify CMC
		const notify = async () => {
			await convertIcpWithCmc({
				blockHeight,
				identity
			});
		};
		await execute({ fn: notify, onProgress, step: ConvertIcpProgressStep.Mint });

		// Reload
		const reload = async () => {
			await waitAndRestartWallet();
		};
		await execute({ fn: reload, onProgress, step: ConvertIcpProgressStep.Reload });
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.convert_icp_to_cycles_error,
			detail: err
		});

		return { success: 'error', err };
	}

	return { success: 'ok' };
};
