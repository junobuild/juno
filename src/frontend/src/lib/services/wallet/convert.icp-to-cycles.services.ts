import type { SelectedWallet } from '$lib/schemas/wallet.schema';
import type { OptionIdentity } from '$lib/types/itentity';
import { type ConvertIcpProgress, ConvertIcpProgressStep } from '$lib/types/progress-convert-icp';
import { assertNonNullish, isEmptyString, isNullish } from '@dfinity/utils';
import { toasts } from '$lib/stores/app/toasts.store';
import { get } from 'svelte/store';
import { i18n } from '$lib/stores/app/i18n.store';
import { assertAndConvertAmountToToken } from '$lib/utils/token.utils';
import { ICP } from '$lib/constants/token.constants';
import { emit } from '$lib/utils/events.utils';
import { waitAndRestartWallet } from '$lib/utils/wallet.utils';
import { execute } from '$lib/services/_progress.services';
import { TopUpProgressStep } from '$lib/types/progress-topup';

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


		// Notify CMC

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
