import { withdrawCycles } from '$lib/api/cycles-ledger.api';
import { topUp as topUpApiWithMissionControl } from '$lib/api/mission-control.api';
import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
import { execute } from '$lib/services/_progress.services';
import { topUpWithCmc } from '$lib/services/top-up/_top-up.cmc.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { type TopUpProgress, TopUpProgressStep } from '$lib/types/progress-topup';
import { emit } from '$lib/utils/events.utils';
import { assertAndConvertAmountToToken, isTokenCycles, isTokenIcp } from '$lib/utils/token.utils';
import { waitAndRestartWallet } from '$lib/utils/wallet.utils';
import { assertNonNullish, isEmptyString, isNullish } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const topUp = async ({
	identity,
	selectedWallet,
	selectedToken,
	balance,
	amount,
	canisterId,
	onProgress
}: {
	identity: OptionIdentity;
	selectedWallet: SelectedWallet | undefined;
	selectedToken: SelectedToken;
	balance: bigint;
	amount: string | undefined;
	canisterId: Principal;
	onProgress: (progress: TopUpProgress | undefined) => void;
}): Promise<{ success: 'ok' | 'error'; err?: unknown }> => {
	if (isNullish(selectedWallet)) {
		toasts.error({
			text: get(i18n).errors.wallet_not_selected
		});
		return { success: 'error' };
	}

	if (isEmptyString(amount)) {
		toasts.error({
			text: get(i18n).errors.invalid_amount_to_top_up
		});
		return { success: 'error' };
	}

	const { valid, tokenAmount } = assertAndConvertAmountToToken({
		balance,
		amount,
		token: selectedToken.token,
		fee: selectedToken.fees.topUp
	});

	if (!valid || isNullish(tokenAmount)) {
		return { success: 'error' };
	}

	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const { type: walletType, walletId } = selectedWallet;

		const topUpWithMissionControl = async () => {
			if (isTokenCycles(selectedToken)) {
				const labels = get(i18n);
				throw new Error(labels.errors.cycles_transfer_not_supported);
			}

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
			if (isTokenIcp(selectedToken)) {
				await topUpWithCmc({
					canisterId,
					identity,
					tokenAmount
				});
				return;
			}

			await withdrawCycles({
				canisterId,
				identity,
				amount: tokenAmount.toUlps()
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
