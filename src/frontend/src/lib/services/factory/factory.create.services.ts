import type { ConsoleDid, MissionControlDid } from '$declarations';
import {
	getCanisterFee,
	getMissionControlFee,
	getOrbiterFee,
	getSatelliteFee
} from '$lib/api/console.api';
import { updateAndStartMonitoring } from '$lib/api/mission-control.api';
import { missionControlMonitored } from '$lib/derived/mission-control/mission-control-settings.derived';
import { missionControlConfigMonitoring } from '$lib/derived/mission-control/mission-control-user.derived';
import { isSkylab } from '$lib/env/app.env';
import type { SelectedWallet } from '$lib/schemas/wallet.schema';
import { execute } from '$lib/services/_progress.services';
import { reloadAccount } from '$lib/services/console/account.services';
import {
	createMissionControlWithConfig as createMissionControlWithConsoleAndConfig,
	createOrbiterWithConfig as createOrbiterWithConsoleAndConfig,
	createSatelliteWithConfig as createSatelliteWithConsoleAndConfig
} from '$lib/services/console/console.factory.services';
import { loadCredits } from '$lib/services/console/credits.services';
import { unsafeSetEmulatorControllerForSatellite } from '$lib/services/emulator.services';
import {
	attachOrbiterToMissionControl,
	attachSatelliteToMissionControl,
	attachSegmentsToMissionControl,
	AttachToMissionControlError
} from '$lib/services/factory/_factory.attach.services';
import {
	createOrbiter,
	createOrbiterWithConfig
} from '$lib/services/mission-control/mission-control.orbiters.services';
import {
	createSatellite as createSatelliteWithMissionControl,
	createSatelliteWithConfig as createSatelliteWithWithMissionControlAndConfig
} from '$lib/services/mission-control/mission-control.satellites.services';
import { loadSettings, loadUserData } from '$lib/services/mission-control/mission-control.services';
import { loadSegments } from '$lib/services/segments.services';
import { waitMissionControlVersionLoaded } from '$lib/services/version/version.mission-control.services';
import { approveCreateCanisterWithCycles } from '$lib/services/wallet/wallet.approve.services';
import { busy } from '$lib/stores/app/busy.store';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type {
	CreateSatelliteConfig,
	CreateWithConfig,
	CreateWithConfigAndName
} from '$lib/types/factory';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { JunoModal, JunoModalCreateSegmentDetail } from '$lib/types/modal';
import type { OrbiterId } from '$lib/types/orbiter';
import {
	type FactoryCreateProgress,
	FactoryCreateProgressStep
} from '$lib/types/progress-factory-create';
import type { SatelliteId } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { emit } from '$lib/utils/events.utils';
import { waitAndRestartWallet } from '$lib/utils/wallet.utils';
import { assertNonNullish, isEmptyString, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import type { PrincipalText } from '@dfinity/zod-schemas';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

type GetFeeBalance =
	| Omit<JunoModalCreateSegmentDetail, 'monitoringConfig' | 'monitoringEnabled'>
	| { error: null | string };

type GetFeeBalanceFn = (params: { identity: OptionIdentity }) => Promise<GetFeeBalance>;

export const initSatelliteWizard = ({
	missionControlId,
	identity
}: {
	missionControlId: Option<Principal>;
	identity: OptionIdentity;
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
	identity: OptionIdentity;
}): Promise<void> =>
	initCreateWizard({
		missionControlId,
		identity,
		feeFn: getCreateOrbiterFeeBalance,
		modalType: 'create_orbiter'
	});

export const initMissionControlWizard = ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<void> =>
	initCreateWizard({
		missionControlId: null,
		identity,
		feeFn: getCreateMissionControlFeeBalance,
		modalType: 'create_mission_control'
	});

export const initCanisterWizard = ({
	missionControlId,
	identity
}: {
	missionControlId: Option<Principal>;
	identity: OptionIdentity;
}): Promise<void> =>
	initCreateWizard({
		missionControlId,
		identity,
		feeFn: getCreateCanisterFeeBalance,
		modalType: 'create_canister'
	});

const initCreateWizard = async ({
	missionControlId,
	identity,
	feeFn,
	modalType
}: {
	missionControlId: Option<MissionControlId>;
	identity: OptionIdentity;
	feeFn: GetFeeBalanceFn;
	modalType: 'create_satellite' | 'create_orbiter' | 'create_mission_control' | 'create_canister';
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

	if (missionControlId === null) {
		busy.stop();

		initCreateWizardWithoutMissionControl({ fee, modalType });
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

	emit<JunoModal<JunoModalCreateSegmentDetail>>({
		message: 'junoModal',
		detail: {
			type: modalType,
			detail: {
				fee,
				monitoringEnabled,
				monitoringConfig
			}
		}
	});
};

const initCreateWizardWithoutMissionControl = ({
	fee,
	modalType
}: {
	fee: ConsoleDid.FactoryFee;
	modalType: 'create_satellite' | 'create_orbiter' | 'create_mission_control' | 'create_canister';
}) => {
	emit<JunoModal<JunoModalCreateSegmentDetail>>({
		message: 'junoModal',
		detail: {
			type: modalType,
			detail: {
				fee,
				monitoringEnabled: false,
				monitoringConfig: undefined
			}
		}
	});
};

const getCreateSatelliteFeeBalance: GetFeeBalanceFn = async (params): Promise<GetFeeBalance> =>
	await getCreateFeeBalance({ ...params, getFee: getSatelliteFee });

const getCreateOrbiterFeeBalance: GetFeeBalanceFn = async (params): Promise<GetFeeBalance> =>
	await getCreateFeeBalance({ ...params, getFee: getOrbiterFee });

const getCreateMissionControlFeeBalance: GetFeeBalanceFn = async (params): Promise<GetFeeBalance> =>
	await getCreateFeeBalance({ ...params, getFee: getMissionControlFee });

const getCreateCanisterFeeBalance: GetFeeBalanceFn = async (params): Promise<GetFeeBalance> =>
	await getCreateFeeBalance({ ...params, getFee: getCanisterFee });

const getCreateFeeBalance = async ({
	identity,
	getFee
}: {
	identity: OptionIdentity;
	getFee: (params: { identity: OptionIdentity }) => Promise<ConsoleDid.FactoryFee>;
}): Promise<GetFeeBalance> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { error: 'No identity provided' };
	}

	const loadFee = async (): Promise<{ fee: ConsoleDid.FactoryFee } | { error: null }> => {
		try {
			const fee = await getFee({ identity });
			return { fee };
		} catch (err: unknown) {
			toasts.error({
				text: get(i18n).errors.load_fees,
				detail: err
			});

			return { error: null };
		}
	};

	const resultFee = await loadFee();

	if ('error' in resultFee) {
		return { error: null };
	}

	const { fee } = resultFee;

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
	selectedWallet: Option<SelectedWallet>;
	missionControlId: Option<Principal>;
	identity: OptionIdentity;
	subnetId: PrincipalText | undefined;
	monitoringStrategy: MissionControlDid.CyclesMonitoringStrategy | undefined;
	withFee: Option<bigint>;
	onProgress: (progress: FactoryCreateProgress | undefined) => void;
}

type CreateWizardResult = Promise<
	| {
			success: 'ok';
			canisterId: Principal;
	  }
	| { success: 'error'; err?: unknown }
	| { success: 'warning' }
>;

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
}): Promise<CreateWizardResult> => {
	if (isEmptyString(satelliteName)) {
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

	const createFn: CreateFn = async ({ identity, selectedWallet: { type: walletType } }) => {
		if (walletType === 'mission_control') {
			return await createWithMissionControlFn({ identity });
		}

		return await createWithConsoleFn({ identity });
	};

	const createConfig: CreateSatelliteConfig = {
		name: satelliteName,
		...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) }),
		kind: satelliteKind
	};

	const createWithConsoleFn = async ({ identity }: { identity: Identity }): Promise<SatelliteId> =>
		await createSatelliteWithConsoleAndConfig({
			identity,
			config: createConfig
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
			config: createConfig
		});

		return satellite_id;
	};

	const buildAttachFn = (): AttachFn | undefined => {
		if (isNullish(missionControlId)) {
			return undefined;
		}

		const attachFn: AttachFn = async ({
			identity,
			canisterId,
			selectedWallet: { type: walletType }
		}) => {
			// Mission Control already knowns the newly created module
			if (walletType === 'mission_control') {
				return;
			}

			// Attach the Satellite to the existing Mission Control.
			// The controller for the Mission Control to the Satellite has been set by the Console backend.
			await attachSatelliteToMissionControl({
				missionControlId,
				satelliteId: canisterId,
				identity,
				satelliteName
			});
		};

		return attachFn;
	};

	const attachFn = buildAttachFn();

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
		await unsafeSetEmulatorControllerForSatellite({
			satelliteId: canisterId,
			identity
		});
	};

	const reloadFn: ReloadFn = async () => {
		await loadSegments({ missionControlId, reload: true, reloadOrbiters: false });
	};

	return await createWizard({
		...rest,
		onProgress,
		createFn,
		reloadFn,
		attachFn,
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
}: CreateWizardParams): Promise<CreateWizardResult> => {
	const createFn: CreateFn = async ({ identity, selectedWallet: { type: walletType } }) => {
		if (walletType === 'mission_control') {
			return await createWithMissionControlFn({ identity });
		}

		return await createWithConsoleFn({ identity });
	};

	const createConfig: CreateWithConfigAndName = {
		...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) })
	};

	const createWithConsoleFn = async ({ identity }: { identity: Identity }): Promise<OrbiterId> =>
		await createOrbiterWithConsoleAndConfig({
			identity,
			config: createConfig
		});

	const createWithMissionControlFn = async ({
		identity
	}: {
		identity: Identity;
	}): Promise<OrbiterId> => {
		const fn = nonNullish(subnetId) ? createOrbiterWithConfig : createOrbiter;

		const { orbiter_id } = await fn({
			identity,
			missionControlId,
			config: createConfig
		});

		return orbiter_id;
	};

	const buildAttachFn = (): AttachFn | undefined => {
		if (isNullish(missionControlId)) {
			return undefined;
		}

		const attachFn: AttachFn = async ({
			identity,
			canisterId,
			selectedWallet: { type: walletType }
		}) => {
			// Mission Control already knowns the newly created module
			if (walletType === 'mission_control') {
				return;
			}

			// Attach the Satellite to the existing Mission Control.
			// The controller for the Mission Control to the Satellite has been set by the Console backend.
			await attachOrbiterToMissionControl({
				missionControlId,
				orbiterId: canisterId,
				identity
			});
		};

		return attachFn;
	};

	const attachFn = buildAttachFn();

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
		await loadSegments({ missionControlId, reload: true, reloadSatellites: false });
	};

	return await createWizard({
		...rest,
		onProgress,
		createFn,
		reloadFn,
		attachFn,
		monitoringFn,
		errorLabel: 'orbiter_unexpected_error'
	});
};

export const createMissionControlWizard = async ({
	onProgress,
	onAttachTextProgress,
	subnetId,
	identity,
	...rest
}: Omit<CreateWizardParams, 'missionControlId' | 'monitoringStrategy'> & {
	onAttachTextProgress: (text: string) => void;
}): Promise<CreateWizardResult> => {
	const createConfig: CreateWithConfig = {
		...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) })
	};

	const createFn: CreateFn = async ({ identity }) =>
		await createMissionControlWithConsoleAndConfig({
			identity,
			config: createConfig
		});

	const reloadFn: ReloadFn = async ({ identity, canisterId }) => {
		await Promise.all([
			reloadAccount({ identity }),
			loadSegments({ missionControlId: canisterId, reload: true }),
			// Loading settings and user data is required to continue directly in the wizard with enabling monitoring
			loadSettings({
				missionControlId: canisterId,
				identity,
				reload: true,
				skipVersionGuard: true
			}),
			loadUserData({
				missionControlId: canisterId,
				identity,
				reload: true,
				skipVersionGuard: true
			})
		]);
	};

	const attachFn: AttachFn = async ({ identity, canisterId }) => {
		await attachSegmentsToMissionControl({
			identity,
			missionControlId: canisterId,
			onTextProgress: onAttachTextProgress
		});
	};

	return await createWizard({
		...rest,
		identity,
		onProgress,
		createFn,
		reloadFn,
		attachFn,
		monitoringFn: undefined,
		errorLabel: 'mission_control_unexpected_error'
	});
};

type CreateFn = (params: {
	identity: Identity;
	selectedWallet: SelectedWallet;
}) => Promise<Principal>;

type MonitoringFn = (params: { identity: Identity; canisterId: Principal }) => Promise<void>;

type FinalizingFn = (params: { identity: Identity; canisterId: Principal }) => Promise<void>;

type ReloadFn = (params: { identity: Identity; canisterId: Principal }) => Promise<void>;

type AttachFn = (params: {
	identity: Identity;
	canisterId: Principal;
	selectedWallet: SelectedWallet;
}) => Promise<void>;

const createWizard = async ({
	selectedWallet,
	identity,
	errorLabel,
	createFn,
	finalizingFn,
	reloadFn,
	attachFn,
	monitoringFn,
	onProgress,
	withFee
}: Omit<CreateWizardParams, 'missionControlId' | 'subnetId' | 'monitoringStrategy'> & {
	errorLabel: keyof I18nErrors;
	createFn: CreateFn;
	finalizingFn?: FinalizingFn;
	reloadFn: ReloadFn;
	attachFn?: AttachFn;
	monitoringFn: MonitoringFn | undefined;
}): Promise<CreateWizardResult> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		assertNonNullish(selectedWallet, get(i18n).errors.wallet_not_selected);

		// If there are fees and the selected wallet is the one of the dev, then the amount is to be paid
		// by the dev wallet (the wallet derived by the identity of the login, the dev ID)
		if (nonNullish(withFee) && withFee > 0n && selectedWallet.type === 'dev') {
			const prepareFn = async (): Promise<void> =>
				await approveCreateCanisterWithCycles({
					identity, // We know the identity is the dev wallet, a bit of a shortcut for now
					amount: withFee
				});

			await execute({
				fn: prepareFn,
				onProgress,
				step: FactoryCreateProgressStep.Approve
			});
		}

		const fn = async (): Promise<Principal> =>
			await createFn({
				identity,
				selectedWallet
			});

		const canisterId = await execute({
			fn,
			onProgress,
			step: FactoryCreateProgressStep.Create
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
				reloadFn({ identity, canisterId })
			]);
		};

		if (nonNullish(attachFn)) {
			const executeAttachFn = async () => {
				await attachFn({ identity, canisterId, selectedWallet });
			};

			try {
				await execute({
					fn: executeAttachFn,
					onProgress,
					step: FactoryCreateProgressStep.Attaching,
					errorState: 'warning'
				});
			} catch (error: unknown) {
				// The module has been created therefore we display a warning and continue the process
				// Attaching can be retried manually separately afterwards
				if (error instanceof AttachToMissionControlError) {
					toasts.error({
						text: error.toString(),
						level: 'warn'
					});
				} else {
					throw error;
				}
			}
		}

		if (nonNullish(monitoringFn)) {
			const executeMonitoringFn = async () => {
				await waitAndRestartWallet();
				await monitoringFn({ identity, canisterId });
			};

			await execute({
				fn: executeMonitoringFn,
				onProgress,
				step: FactoryCreateProgressStep.Monitoring
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
					step: FactoryCreateProgressStep.Finalizing
				});
			} catch (_error: unknown) {
				// This is used for development purpose only. We continue the wizard even if it failed.
			}
		}

		// Reload list of segments and wallet or credits before navigation
		await execute({
			fn: reload,
			onProgress,
			step: FactoryCreateProgressStep.Reload
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
