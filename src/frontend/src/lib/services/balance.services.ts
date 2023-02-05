import { getCredits } from '$lib/api/console.api';
import { getAccountIdentifier, getBalance } from '$lib/api/ledger.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { isNullish } from '$lib/utils/utils';
import type { AccountIdentifier } from '@dfinity/nns';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

export interface MissionControlBalance {
	balance: bigint;
	credits: bigint;
	accountIdentifier: AccountIdentifier;
}

export const getMissionControlBalance = async (
	missionControlId: Principal | undefined | null
): Promise<{ result: MissionControlBalance | undefined; error?: unknown }> => {
	if (isNullish(missionControlId)) {
		return { result: undefined };
	}

	try {
		const accountIdentifier = getAccountIdentifier(missionControlId);

		const queryBalance = async (): Promise<bigint> => (await getBalance(accountIdentifier)).toE8s();

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
