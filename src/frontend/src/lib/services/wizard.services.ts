import { getOrbiterFee, getSatelliteFee } from '$lib/api/console.api';
import { getMissionControlBalance } from '$lib/services/balance.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { JunoModalCreateSatelliteDetail } from '$lib/types/modal';
import { isNullish, nonNullish } from '$lib/utils/utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

export type GetFeeBalance = { result?: JunoModalCreateSatelliteDetail; error?: unknown };

export const getCreateSatelliteFeeBalance = async (params: {
	identity: Identity | undefined | null;
	missionControlId: Principal | undefined | null;
}): Promise<GetFeeBalance> => getCreateFeeBalance({ ...params, getFee: getSatelliteFee });

export const getCreateOrbiterFeeBalance = async (params: {
	identity: Identity | undefined | null;
	missionControlId: Principal | undefined | null;
}): Promise<GetFeeBalance> => getCreateFeeBalance({ ...params, getFee: getOrbiterFee });

const getCreateFeeBalance = async ({
	identity,
	missionControlId,
	getFee
}: {
	identity: Identity | undefined | null;
	missionControlId: Principal | undefined | null;
	getFee: (user: Principal) => Promise<bigint>;
}): Promise<GetFeeBalance> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { error: 'No identity provided' };
	}

	const fee = await getFee(identity.getPrincipal());

	if (fee === 0n) {
		return {
			result: {
				fee
			}
		};
	}

	const { result, error } = await getMissionControlBalance(missionControlId);

	if (nonNullish(error)) {
		return { error };
	}

	if (isNullish(result)) {
		toasts.error({ text: labels.errors.no_mission_control });
		return { error: labels.errors.no_mission_control };
	}

	return {
		result: {
			fee,
			missionControlBalance: {
				...result
			}
		}
	};
};
