import type { MissionControlDid } from '$declarations';
import { getOrbiterFee, getSatelliteFee } from '$lib/api/console.api';
import { getAccountIdentifier } from '$lib/api/icp-index.api';
import { updateAndStartMonitoring } from '$lib/api/mission-control.api';
import { missionControlMonitored } from '$lib/derived/mission-control/mission-control-settings.derived';
import { missionControlConfigMonitoring } from '$lib/derived/mission-control/mission-control-user.derived';
import { isSkylab } from '$lib/env/app.env';
import { execute } from '$lib/services/_progress.services';
import { reloadAccount } from '$lib/services/console/account.services';
import { createSatelliteWithConfig as createSatelliteWithConsoleAndConfig } from '$lib/services/console/console.satellites.services';
import { createOrbiterWithConfig as createOrbiterWithConsoleAndConfig } from '$lib/services/console/console.orbiters.services';
import { loadCredits } from '$lib/services/console/credits.services';
import { unsafeSetEmulatorControllerForSatellite } from '$lib/services/emulator.services';
import {
	createOrbiter,
	createOrbiterWithConfig,
	loadOrbiters
} from '$lib/services/mission-control/mission-control.orbiters.services';
import {
	createSatellite as createSatelliteWithMissionControl,
	createSatelliteWithConfig as createSatelliteWithWithMissionControlAndConfig,
	loadSatellites
} from '$lib/services/mission-control/mission-control.satellites.services';
import { loadSettings, loadUserData } from '$lib/services/mission-control/mission-control.services';
import { waitMissionControlVersionLoaded } from '$lib/services/version/version.mission-control.services';
import { approveCreateCanisterWithIcp } from '$lib/services/wallet/wallet.transfer.services';
import { busy } from '$lib/stores/app/busy.store';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { JunoModal, JunoModalCreateSegmentDetail } from '$lib/types/modal';
import type { OrbiterId } from '$lib/types/orbiter';
import { type WizardCreateProgress, WizardCreateProgressStep } from '$lib/types/progress-wizard';
import type { SatelliteId } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { emit } from '$lib/utils/events.utils';
import { waitAndRestartWallet } from '$lib/utils/wallet.utils';
import { assertNonNullish, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import type { PrincipalText } from '@dfinity/zod-schemas';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
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
	if (missionControlId === undefined) {
		toasts.warn(get(i18n).errors.mission_control_not_loaded);
		return;
	}

	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return;
	}

	busy.start();

	const resultFee = await feeFn({
		identity
	});

	if ('error' in resultFee) {
		busy.stop();
		return;
	}

	const { fee } = resultFee;

	// TODO: extract function
	if (missionControlId === null) {
		busy.stop();

		const accountIdentifier = getAccountIdentifier(identity.getPrincipal());

		emit<JunoModal<JunoModalCreateSegmentDetail>>({
			message: 'junoModal',
			detail: {
				type: modalType,
				detail: {
					accountIdentifier,
					fee,
					monitoringEnabled: false,
					monitoringConfig: undefined
				}
			}
		});
		return;
	}

	const { result } = await waitMissionControlVersionLoaded();

	if (result === 'error') {
		busy.stop();
		return;
	}

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
	monitoringStrategy: MissionControlDid.CyclesMonitoringStrategy | undefined;
	withFee: Option<bigint>;
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
			canisterId: Principal;
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

	const createWithConsoleFn = async ({ identity }: { identity: Identity }): Promise<SatelliteId> =>
		await createSatelliteWithConsoleAndConfig({
			identity,
			// TODO: duplicate payload
			config: {
				name: satelliteName,
				...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) }),
				kind: satelliteKind
			}
		});

	const createWithMissionControlFn = async ({
		identity
	}: {
		identity: Identity;
	}): Promise<SatelliteId> => {
		const fn =
			nonNullish(subnetId) || satelliteKind !== 'website'
				? createSatelliteWithWithMissionControlAndConfig
				: createSatelliteWithMissionControl;

		const { satellite_id } = await fn({
			identity,
			missionControlId,
			config: {
				name: satelliteName,
				...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) }),
				kind: satelliteKind
			}
		});

		return satellite_id;
	};

	const buildMonitoringFn = (): MonitoringFn | undefined => {
		if (isNullish(monitoringStrategy)) {
			return undefined;
		}

		return async ({
			identity,
			canisterId
		}: {
			identity: Identity;
			canisterId: Principal;
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
							ids: [canisterId]
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
		canisterId
	}: {
		identity: Identity;
		canisterId: Principal;
	}): Promise<void> => {
		assertNonNullish(missionControlId);

		await unsafeSetEmulatorControllerForSatellite({
			missionControlId,
			satelliteId: canisterId,
			identity
		});
	};

	const reloadFn = async ({ identity }: { identity: Identity }) => {
		if (isNullish(missionControlId)) {
			await reloadAccount({ identity });
			return;
		}

		await loadSatellites({ missionControlId, reload: true });
	};

	return await createWizard({
		...rest,
		missionControlId,
		onProgress,
		createFn: missionControlId === null ? createWithConsoleFn : createWithMissionControlFn,
		reloadFn,
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
			canisterId: Principal;
	  }
	| { success: 'error'; err?: unknown }
> => {
	const createWithConsoleFn = async ({ identity }: { identity: Identity }): Promise<OrbiterId> =>
		await createOrbiterWithConsoleAndConfig({
			identity,
			// TODO: duplicate payload
			config: {
				...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) })
			}
		});

	const createWithMissionControlFn = async ({ identity }: { identity: Identity }): Promise<OrbiterId> => {
		const fn = nonNullish(subnetId) ? createOrbiterWithConfig : createOrbiter;

		const { orbiter_id } = await fn({
			identity,
			missionControlId,
			config: {
				...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) })
			}
		});

		return orbiter_id;
	};

	const buildMonitoringFn = (): MonitoringFn | undefined => {
		if (isNullish(monitoringStrategy)) {
			return undefined;
		}

		return async ({
			identity,
			canisterId
		}: {
			identity: Identity;
			canisterId: Principal;
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
							ids: [canisterId]
						})
					})
				}
			});
		};
	};

	const monitoringFn = buildMonitoringFn();

	const reloadFn = async () => {
		await loadOrbiters({ missionControlId, reload: true });
	};

	return await createWizard({
		...rest,
		missionControlId,
		onProgress,
		createFn: missionControlId === null ? createWithConsoleFn : createWithMissionControlFn,
		reloadFn,
		monitoringFn,
		errorLabel: 'orbiter_unexpected_error'
	});
};

type MonitoringFn = (params: { identity: Identity; canisterId: Principal }) => Promise<void>;

type FinalizingFn = (params: { identity: Identity; canisterId: Principal }) => Promise<void>;

type ReloadFn = (params: { identity: Identity }) => Promise<void>;

const createWizard = async ({
	missionControlId,
	identity,
	errorLabel,
	createFn,
	finalizingFn,
	reloadFn,
	monitoringFn,
	onProgress,
	withFee
}: Omit<CreateWizardParams, 'subnetId' | 'monitoringStrategy'> & {
	errorLabel: keyof I18nErrors;
	createFn: (params: { identity: Identity }) => Promise<Principal>;
	finalizingFn?: FinalizingFn;
	reloadFn: ReloadFn;
	monitoringFn: MonitoringFn | undefined;
}): Promise<
	| {
			success: 'ok';
			canisterId: Principal;
	  }
	| { success: 'error'; err?: unknown }
> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		// If there are fees and the dev has no mission control, then the amount is to be paid
		// by the dev wallet (the wallet derived by the identity of the login, the dev ID)
		if (nonNullish(withFee) && withFee > 0n && isNullish(missionControlId)) {
			const prepareFn = async (): Promise<void> =>
				await approveCreateCanisterWithIcp({
					identity,
					amount: withFee
				});

			await execute({
				fn: prepareFn,
				onProgress,
				step: WizardCreateProgressStep.Approve
			});
		}

		const fn = async (): Promise<Principal> =>
			await createFn({
				identity
			});

		const canisterId = await execute({
			fn,
			onProgress,
			step: WizardCreateProgressStep.Create
		});

		const reload = async () => {
			const withCredits = isNullish(withFee) || withFee === 0n;

			await Promise.allSettled([
				...(withCredits
					? [
							loadCredits({
								identity,
								reload: true
							})
						]
					: [waitAndRestartWallet()]),
				reloadFn({ identity })
			]);
		};

		if (nonNullish(monitoringFn)) {
			const executeMonitoringFn = async () => {
				await waitAndRestartWallet();
				await monitoringFn({ identity, canisterId });
			};

			await execute({
				fn: executeMonitoringFn,
				onProgress,
				step: WizardCreateProgressStep.Monitoring
			});
		}

		if (nonNullish(finalizingFn)) {
			const executeFinalizingFn = async () => {
				await finalizingFn({ identity, canisterId });
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

		return { success: 'ok', canisterId };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors[errorLabel],
			detail: err
		});

		return { success: 'error', err };
	}
};
