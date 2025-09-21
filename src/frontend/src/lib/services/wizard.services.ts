import type {
	CyclesMonitoringStrategy,
	Orbiter,
	Satellite
} from '$declarations/mission_control/mission_control.did';
import { getOrbiterFee, getSatelliteFee } from '$lib/api/console.api';
import { getAccountIdentifier } from '$lib/api/icp-index.api';
import { updateAndStartMonitoring } from '$lib/api/mission-control.api';
import { missionControlMonitored } from '$lib/derived/mission-control-settings.derived';
import { missionControlConfigMonitoring } from '$lib/derived/mission-control-user.derived';
import { isSkylab } from '$lib/env/app.env';
import { loadCredits } from '$lib/services/credits.services';
import { unsafeSetEmulatorControllerForSatellite } from '$lib/services/emulator.services';
import { loadSettings, loadUserData } from '$lib/services/mission-control.services';
import {
	createOrbiter,
	createOrbiterWithConfig,
	loadOrbiters
} from '$lib/services/orbiter/orbiters.services';
import { execute } from '$lib/services/progress.services';
import {
	createSatellite,
	createSatelliteWithConfig,
	loadSatellites
} from '$lib/services/satellites.services';
import { waitMissionControlVersionLoaded } from '$lib/services/version/version.mission-control.services';
import { busy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { JunoModal, JunoModalCreateSegmentDetail } from '$lib/types/modal';
import { type WizardCreateProgress, WizardCreateProgressStep } from '$lib/types/progress-wizard';
import type { Option } from '$lib/types/utils';
import { emit } from '$lib/utils/events.utils';
import { waitAndRestartWallet } from '$lib/utils/wallet.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import type { PrincipalText } from '@dfinity/zod-schemas';
import { get } from 'svelte/store';

type GetFeeBalance =
	| Omit<
			JunoModalCreateSegmentDetail,
			'monitoringConfig' | 'monitoringEnabled' | 'accountIdentifier'
	  >
	| { error: null | string };

type GetFeeBalanceFn = (params: { identity: Option<Identity> }) => Promise<GetFeeBalance>;

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
	missionControlId: Option<MissionControlId>;
	identity: Option<Identity>;
	feeFn: GetFeeBalanceFn;
	modalType: 'create_satellite' | 'create_orbiter';
}) => {
	if (isNullish(missionControlId)) {
		toasts.warn(get(i18n).errors.mission_control_not_loaded);
		return;
	}

	busy.start();

	const { result } = await waitMissionControlVersionLoaded();

	if (result === 'error') {
		busy.stop();
		return;
	}

	const resultFee = await feeFn({
		identity
	});

	if ('error' in resultFee) {
		busy.stop();
		return;
	}

	const { fee } = resultFee;

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

	const accountIdentifier = getAccountIdentifier(missionControlId);

	emit<JunoModal<JunoModalCreateSegmentDetail>>({
		message: 'junoModal',
		detail: {
			type: modalType,
			detail: {
				accountIdentifier,
				fee,
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
	getFee
}: {
	identity: OptionIdentity;
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
			fee
		};
	}

	const { result } = await loadCredits({
		identity,
		reload: true
	});

	if (result === 'error') {
		return { error: null };
	}

	return {
		fee
	};
};

interface CreateWizardParams {
	missionControlId: Option<Principal>;
	identity: OptionIdentity;
	subnetId: PrincipalText | undefined;
	monitoringStrategy: CyclesMonitoringStrategy | undefined;
	withCredits: boolean;
	onProgress: (progress: WizardCreateProgress | undefined) => void;
}

export const createSatelliteWizard = async ({
	missionControlId,
	onProgress,
	subnetId,
	satelliteName,
	satelliteKind,
	monitoringStrategy,
	...rest
}: CreateWizardParams & {
	satelliteName: string | undefined;
	satelliteKind: 'website' | 'application' | undefined;
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

	if (isNullish(satelliteKind)) {
		toasts.error({
			text: get(i18n).errors.satellite_kind
		});
		return { success: 'error' };
	}

	const createFn = async ({ identity }: { identity: Identity }): Promise<Satellite> => {
		const fn =
			nonNullish(subnetId) || satelliteKind !== 'website'
				? createSatelliteWithConfig
				: createSatellite;

		return await fn({
			identity,
			missionControlId,
			config: {
				name: satelliteName,
				...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) }),
				kind: satelliteKind
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

	const unsafeFinalizingFn = async ({
		identity,
		segment
	}: {
		identity: Identity;
		segment: Satellite;
	}): Promise<void> => {
		assertNonNullish(missionControlId);

		await unsafeSetEmulatorControllerForSatellite({
			missionControlId,
			satelliteId: segment.satellite_id,
			identity
		});
	};

	return await createWizard({
		...rest,
		missionControlId,
		onProgress,
		createFn,
		reloadFn: loadSatellites,
		monitoringFn,
		errorLabel: 'satellite_unexpected_error',
		...(isSkylab() && { finalizingFn: unsafeFinalizingFn })
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

type FinalizingFn<T> = (params: { identity: Identity; segment: T }) => Promise<void>;

const createWizard = async <T>({
	missionControlId,
	identity,
	errorLabel,
	createFn,
	finalizingFn,
	reloadFn,
	monitoringFn,
	onProgress,
	withCredits
}: Omit<CreateWizardParams, 'subnetId' | 'monitoringStrategy'> & {
	errorLabel: keyof I18nErrors;
	createFn: (params: { identity: Identity }) => Promise<T>;
	finalizingFn?: FinalizingFn<T>;
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
			await Promise.allSettled([
				...(withCredits
					? [
							loadCredits({
								identity,
								reload: true
							})
						]
					: [waitAndRestartWallet()]),
				reloadFn({ missionControlId, reload: true })
			]);
		};

		if (nonNullish(monitoringFn)) {
			const executeMonitoringFn = async () => {
				await waitAndRestartWallet();
				await monitoringFn({ identity, segment });
			};

			await execute({
				fn: executeMonitoringFn,
				onProgress,
				step: WizardCreateProgressStep.Monitoring
			});
		}

		if (nonNullish(finalizingFn)) {
			const executeFinalizingFn = async () => {
				await finalizingFn({ identity, segment });
			};

			try {
				await execute({
					fn: executeFinalizingFn,
					onProgress,
					step: WizardCreateProgressStep.Finalizing
				});
			} catch (_error: unknown) {
				// This is used for development purpose only. We continue the wizard even if it failed.
			}
		}

		// Reload list of segments and wallet or credits before navigation
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
