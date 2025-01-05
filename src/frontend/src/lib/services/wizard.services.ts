import { getOrbiterFee, getSatelliteFee } from '$lib/api/console.api';
import { missionControlMonitoringConfig } from '$lib/derived/mission-control.derived';
import { getMissionControlBalance } from '$lib/services/balance.services';
import { loadVersion } from '$lib/services/console.services';
import { loadSettings } from '$lib/services/mission-control.services';
import { busy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { JunoModal, JunoModalCreateSegmentDetail } from '$lib/types/modal';
import type { Option } from '$lib/types/utils';
import { emit } from '$lib/utils/events.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { isNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

interface GetFeeBalance {
	result?: Omit<JunoModalCreateSegmentDetail, 'monitoringConfig'>;
	error?: unknown;
}

type GetFeeBalanceFn = (params: {
	missionControlId: Principal;
	identity: Option<Identity>;
}) => Promise<GetFeeBalance>;

export const initSatelliteWizard = async ({
	missionControlId,
	identity
}: {
	missionControlId: Option<Principal>;
	identity: Option<Identity>;
}) =>
	initCreateWizard({
		missionControlId,
		identity,
		feeFn: getCreateSatelliteFeeBalance,
		modalType: 'create_satellite'
	});

export const initOrbiterWizard = async ({
	missionControlId,
	identity
}: {
	missionControlId: Option<Principal>;
	identity: Option<Identity>;
}) =>
	initCreateWizard({
		missionControlId,
		identity,
		feeFn: getCreateSatelliteFeeBalance,
		modalType: 'create_satellite'
	});

const initCreateWizard = async ({
	missionControlId,
	identity,
	feeFn,
	modalType
}: {
	missionControlId: Option<Principal>;
	identity: Option<Identity>;
	feeFn: GetFeeBalanceFn;
	modalType: 'create_satellite' | 'create_orbiter';
}) => {
	if (isNullish(missionControlId)) {
		toasts.warn(get(i18n).errors.mission_control_not_loaded);
		return;
	}

	busy.start();

	const { result: feeBalance, error } = await feeFn({
		identity,
		missionControlId
	});

	if (nonNullish(error) || isNullish(feeBalance)) {
		busy.stop();
		return;
	}

	await loadVersion({
		satelliteId: undefined,
		missionControlId,
		skipReload: true
	});

	const { success } = await loadSettings({
		identity,
		missionControlId
	});

	busy.stop();

	if (!success) {
		return;
	}

	const monitoringConfig = get(missionControlMonitoringConfig);

	emit<JunoModal<JunoModalCreateSegmentDetail>>({
		message: 'junoModal',
		detail: {
			type: modalType,
			detail: {
				...feeBalance,
				monitoringConfig
			}
		}
	});
};

const getCreateSatelliteFeeBalance: GetFeeBalanceFn = async (params): Promise<GetFeeBalance> =>
	await getCreateFeeBalance({ ...params, getFee: getSatelliteFee });

const getCreateOrbiterFeeBalance: GetFeeBalanceFn = async (params): Promise<GetFeeBalance> =>
	await getCreateFeeBalance({ ...params, getFee: getOrbiterFee });

const getCreateFeeBalance = async ({
	identity,
	missionControlId,
	getFee
}: {
	identity: OptionIdentity;
	missionControlId: Option<Principal>;
	getFee: (params: { user: Principal; identity: OptionIdentity }) => Promise<bigint>;
}): Promise<GetFeeBalance> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { error: 'No identity provided' };
	}

	const fee = await getFee({ user: identity.getPrincipal(), identity });

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
