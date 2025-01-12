import type {
	CyclesMonitoringStrategy,
	Orbiter,
	Satellite
} from '$declarations/mission_control/mission_control.did';
import { getOrbiterFee, getSatelliteFee } from '$lib/api/console.api';
import { updateAndStartMonitoring } from '$lib/api/mission-control.api';
import { missionControlMonitored } from '$lib/derived/mission-control-settings.derived';
import { missionControlConfigMonitoring } from '$lib/derived/mission-control-user.derived';
import { getMissionControlBalance } from '$lib/services/balance.services';
import { loadVersion } from '$lib/services/console.services';
import { loadSettings, loadUserData } from '$lib/services/mission-control.services';
import {
	createOrbiter,
	createOrbiterWithConfig,
	loadOrbiters
} from '$lib/services/orbiters.services';
import { execute } from '$lib/services/progress.services';
import {
	createSatellite,
	createSatelliteWithConfig,
	loadSatellites
} from '$lib/services/satellites.services';
import { busy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { JunoModal, JunoModalCreateSegmentDetail } from '$lib/types/modal';
import type { PrincipalText } from '$lib/types/principal';
import type { Option } from '$lib/types/utils';
import { type WizardCreateProgress, WizardCreateProgressStep } from '$lib/types/wizard';
import { emit } from '$lib/utils/events.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

interface GetFeeBalance {
	result?: Omit<JunoModalCreateSegmentDetail, 'monitoringConfig' | 'monitoringEnabled'>;
	error?: unknown;
}

type GetFeeBalanceFn = (params: {
	missionControlId: Principal;
	identity: Option<Identity>;
}) => Promise<GetFeeBalance>;

export const initSatelliteWizard = ({
	missionControlId,
	identity
}: {
	missionControlId: Option<Principal>;
	identity: Option<Identity>;
}): Promise<void> =>
	initCreateWizard({
		missionControlId,
		identity,
		feeFn: getCreateSatelliteFeeBalance,
		modalType: 'create_satellite'
	});

export const initOrbiterWizard = ({
	missionControlId,
	identity
}: {
	missionControlId: Option<Principal>;
	identity: Option<Identity>;
}): Promise<void> =>
	initCreateWizard({
		missionControlId,
		identity,
		feeFn: getCreateOrbiterFeeBalance,
		modalType: 'create_orbiter'
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

	const params = {
		identity,
		missionControlId
	};

	const [{ success: settingsSuccess }, { success: userSuccess }] = await Promise.all([
		loadSettings(params),
		loadUserData(params)
	]);

	busy.stop();

	if (!settingsSuccess || !userSuccess) {
		return;
	}

	const monitoringEnabled = get(missionControlMonitored);
	const monitoringConfig = get(missionControlConfigMonitoring);

	emit<JunoModal<JunoModalCreateSegmentDetail>>({
		message: 'junoModal',
		detail: {
			type: modalType,
			detail: {
				...feeBalance,
				monitoringEnabled,
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

interface CreateWizardParams {
	missionControlId: Option<Principal>;
	identity: OptionIdentity;
	subnetId: PrincipalText | undefined;
	monitoringStrategy: CyclesMonitoringStrategy | undefined;
	onProgress: (progress: WizardCreateProgress | undefined) => void;
}

export const createSatelliteWizard = async ({
	missionControlId,
	onProgress,
	subnetId,
	satelliteName,
	monitoringStrategy,
	...rest
}: CreateWizardParams & {
	satelliteName: string | undefined;
}): Promise<
	| {
			success: 'ok';
			segment: Satellite;
	  }
	| { success: 'error'; err?: unknown }
> => {
	if (isNullish(satelliteName)) {
		toasts.error({
			text: get(i18n).errors.satellite_name_missing
		});
		return { success: 'error' };
	}

	const createFn = async ({ identity }: { identity: Identity }): Promise<Satellite> => {
		const fn = nonNullish(subnetId) ? createSatelliteWithConfig : createSatellite;

		return await fn({
			identity,
			missionControlId,
			config: {
				name: satelliteName,
				...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) })
			}
		});
	};

	const buildMonitoringFn = (): MonitoringFn<Satellite> | undefined => {
		if (isNullish(monitoringStrategy)) {
			return undefined;
		}

		return async ({
			identity,
			segment
		}: {
			identity: Identity;
			segment: Satellite;
		}): Promise<void> => {
			assertNonNullish(missionControlId);

			await updateAndStartMonitoring({
				identity,
				missionControlId,
				config: {
					cycles_config: toNullable({
						mission_control_strategy: toNullable(),
						satellites_strategy: toNullable({
							strategy: monitoringStrategy,
							ids: [segment.satellite_id]
						}),
						orbiters_strategy: toNullable()
					})
				}
			});
		};
	};

	const monitoringFn = buildMonitoringFn();

	return await createWizard({
		...rest,
		missionControlId,
		onProgress,
		createFn,
		reloadFn: loadSatellites,
		monitoringFn,
		errorLabel: 'satellite_unexpected_error'
	});
};

export const createOrbiterWizard = async ({
	missionControlId,
	onProgress,
	subnetId,
	monitoringStrategy,
	...rest
}: CreateWizardParams): Promise<
	| {
			success: 'ok';
			segment: Orbiter;
	  }
	| { success: 'error'; err?: unknown }
> => {
	const createFn = async ({ identity }: { identity: Identity }): Promise<Orbiter> => {
		const fn = nonNullish(subnetId) ? createOrbiterWithConfig : createOrbiter;

		return await fn({
			identity,
			missionControlId,
			config: {
				...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) })
			}
		});
	};

	const buildMonitoringFn = (): MonitoringFn<Orbiter> | undefined => {
		if (isNullish(monitoringStrategy)) {
			return undefined;
		}

		return async ({
			identity,
			segment
		}: {
			identity: Identity;
			segment: Orbiter;
		}): Promise<void> => {
			assertNonNullish(missionControlId);

			await updateAndStartMonitoring({
				identity,
				missionControlId,
				config: {
					cycles_config: toNullable({
						mission_control_strategy: toNullable(),
						satellites_strategy: toNullable(),
						orbiters_strategy: toNullable({
							strategy: monitoringStrategy,
							ids: [segment.orbiter_id]
						})
					})
				}
			});
		};
	};

	const monitoringFn = buildMonitoringFn();

	return await createWizard({
		...rest,
		missionControlId,
		onProgress,
		createFn,
		reloadFn: loadOrbiters,
		monitoringFn,
		errorLabel: 'orbiter_unexpected_error'
	});
};

type MonitoringFn<T> = (params: { identity: Identity; segment: T }) => Promise<void>;

const createWizard = async <T>({
	missionControlId,
	identity,
	errorLabel,
	createFn,
	reloadFn,
	monitoringFn,
	onProgress
}: Omit<CreateWizardParams, 'subnetId' | 'monitoringStrategy'> & {
	errorLabel: keyof I18nErrors;
	createFn: (params: { identity: Identity }) => Promise<T>;
	reloadFn: (params: {
		missionControlId: Option<Principal>;
		reload: boolean;
	}) => Promise<{ result: 'skip' | 'success' | 'error' }>;
	monitoringFn: MonitoringFn<T> | undefined;
}): Promise<
	| {
			success: 'ok';
			segment: T;
	  }
	| { success: 'error'; err?: unknown }
> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const fn = async (): Promise<T> =>
			await createFn({
				identity
			});

		const segment = await execute({
			fn,
			onProgress,
			step: WizardCreateProgressStep.Create
		});

		const reload = async () => {
			await reloadFn({ missionControlId, reload: true });
		};

		if (nonNullish(monitoringFn)) {
			const executeMonitoringFn = async () => {
				await monitoringFn({ identity, segment });
			};

			await execute({
				fn: executeMonitoringFn,
				onProgress,
				step: WizardCreateProgressStep.Monitoring
			});
		}

		// Reload list of segments before navigation
		await execute({
			fn: reload,
			onProgress,
			step: WizardCreateProgressStep.Reload
		});

		return { success: 'ok', segment };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors[errorLabel],
			detail: err
		});

		return { success: 'error', err };
	}
};
