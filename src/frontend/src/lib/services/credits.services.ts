import { getCredits as getCreditsApi } from '$lib/api/console.api';
import { getAccountIdentifier, getBalance } from '$lib/api/icp-index.api';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { MissionControlBalance } from '$lib/types/balance';
import type { Option } from '$lib/types/utils';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const loadCredits = async (
	missionControlId: Option<Principal>
): Promise<{ result: MissionControlBalance | undefined; error?: unknown }> => {
	if (isNullish(missionControlId)) {
		return { result: undefined };
	}

	try {
		const accountIdentifier = getAccountIdentifier(missionControlId);

		const identity = get(authStore).identity;

		const queryBalance = async (): Promise<bigint> =>
			await getBalance({ owner: missionControlId, identity });

		const [balance, credits] = await Promise.all([queryBalance(), getCreditsApi(identity)]);

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
