import { getCredits } from '$lib/api/console.api';
import { getAccountIdentifier, getBalance } from '$lib/api/ledger.api';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { MissionControlBalance } from '$lib/types/balance.types';
import { isNullish } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

export const getMissionControlBalance = async (
	missionControlId: Principal | undefined | null
): Promise<{ result: MissionControlBalance | undefined; error?: unknown }> => {
	if (isNullish(missionControlId)) {
		return { result: undefined };
	}

	try {
		const accountIdentifier = getAccountIdentifier(missionControlId);

		const identity = get(authStore).identity;

		const queryBalance = async (): Promise<bigint> =>
			await getBalance({ owner: missionControlId, identity });

		const [balance, credits] = await Promise.all([queryBalance(), getCredits()]);

		return {
			result: {
				accountIdentifier,
				balance,
				credits
			}
		};
	} catch (error: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.ledger_balance_credits,
			detail: error
		});

		return { result: undefined, error };
	}
};
