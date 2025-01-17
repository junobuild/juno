import { topUp as topUpApi } from '$lib/api/mission-control.api';
import { TOP_UP_NETWORK_FEES } from '$lib/constants/constants';
import { execute } from '$lib/services/progress.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import { type TopUpProgress, TopUpProgressStep } from '$lib/types/progress-topup';
import type { Option } from '$lib/types/utils';
import { emit } from '$lib/utils/events.utils';
import { assertAndConvertAmountToICPToken } from '$lib/utils/token.utils';
import { waitAndRestartWallet } from '$lib/utils/wallet.utils';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const topUp = async ({
	identity,
	missionControlId,
	cycles,
	balance,
	icp,
	canisterId,
	onProgress
}: {
	identity: OptionIdentity;
	missionControlId: Option<MissionControlId>;
	cycles: number | undefined;
	balance: bigint;
	icp: string | undefined;
	canisterId: Principal;
	onProgress: (progress: TopUpProgress | undefined) => void;
}): Promise<{ success: 'ok' | 'error'; err?: unknown }> => {
	assertNonNullish(identity, get(i18n).core.not_logged_in);

	if (isNullish(missionControlId)) {
		toasts.error({
			text: get(i18n).errors.no_mission_control
		});
		return { success: 'error' };
	}

	if (isNullish(cycles)) {
		toasts.error({
			text: get(i18n).errors.invalid_amount_to_top_up
		});
		return { success: 'error' };
	}

	const { valid, tokenAmount } = assertAndConvertAmountToICPToken({
		balance,
		amount: icp,
		fee: TOP_UP_NETWORK_FEES
	});

	if (!valid || isNullish(tokenAmount)) {
		return { success: 'error' };
	}

	try {
		const topUp = async () =>
			await topUpApi({
				canisterId,
				missionControlId,
				e8s: tokenAmount.toE8s(),
				identity
			});
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
