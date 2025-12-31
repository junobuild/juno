import { topUp as topUpApiWithMissionControl } from '$lib/api/mission-control.api';
import { ICP_TOP_UP_FEE } from '$lib/constants/token.constants';
import type { SelectedWallet } from '$lib/schemas/wallet.schema';
import { execute } from '$lib/services/_progress.services';
import { topUpWithCmc } from '$lib/services/top-up/_top-up.cmc.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { type TopUpProgress, TopUpProgressStep } from '$lib/types/progress-topup';
import { emit } from '$lib/utils/events.utils';
import { assertAndConvertAmountToToken } from '$lib/utils/token.utils';
import { waitAndRestartWallet } from '$lib/utils/wallet.utils';
import { assertNonNullish, ICPToken, isNullish } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const topUp = async ({
	identity,
	selectedWallet,
	cycles,
	balance,
	icp,
	canisterId,
	onProgress
}: {
	identity: OptionIdentity;
	selectedWallet: SelectedWallet | undefined;
	cycles: bigint | undefined;
	balance: bigint;
	icp: string | undefined;
	canisterId: Principal;
	onProgress: (progress: TopUpProgress | undefined) => void;
}): Promise<{ success: 'ok' | 'error'; err?: unknown }> => {
	if (isNullish(selectedWallet)) {
		toasts.error({
			text: get(i18n).errors.wallet_not_selected
		});
		return { success: 'error' };
	}

	if (isNullish(cycles)) {
		toasts.error({
			text: get(i18n).errors.invalid_amount_to_top_up
		});
		return { success: 'error' };
	}

	const { valid, tokenAmount } = assertAndConvertAmountToToken({
		balance,
		amount: icp,
		token: ICPToken,
		fee: ICP_TOP_UP_FEE
	});

	if (!valid || isNullish(tokenAmount)) {
		return { success: 'error' };
	}

	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const { type: walletType, walletId } = selectedWallet;

		const topUpWithMissionControl = async () => {
			// We do not use subaccount
			const { owner: missionControlId } = walletId;

			await topUpApiWithMissionControl({
				canisterId,
				missionControlId,
				e8s: tokenAmount.toE8s(),
				identity
			});
		};

		const topUpWithDev = async () => {
			await topUpWithCmc({
				canisterId,
				identity,
				tokenAmount
			});
		};

		const topUp = walletType === 'mission_control' ? topUpWithMissionControl : topUpWithDev;
		await execute({ fn: topUp, onProgress, step: TopUpProgressStep.TopUp });

		const reload = async () => {
			emit({ message: 'junoRestartCycles', detail: { canisterId } });

			await waitAndRestartWallet();
		};
		await execute({ fn: reload, onProgress, step: TopUpProgressStep.Reload });
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.top_up_error,
			detail: err
		});

		return { success: 'error', err };
	}

	return { success: 'ok' };
};
