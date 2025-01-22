import type {
	Config,
	CyclesMonitoringStrategy,
	CyclesThreshold,
	DepositedCyclesEmailNotification,
	MonitoringConfig
} from '$declarations/mission_control/mission_control.did';
import {
	setConfig,
	setMetadata,
	updateAndStartMonitoring,
	updateAndStopMonitoring
} from '$lib/api/mission-control.api';
import { METADATA_KEY_EMAIL } from '$lib/constants/metadata.constants';
import {
	missionControlSettings,
	missionControlSettingsNotLoaded
} from '$lib/derived/mission-control-settings.derived';
import { missionControlUserData } from '$lib/derived/mission-control-user.derived';
import { orbiterNotLoaded, orbiterStore } from '$lib/derived/orbiter.derived';
import { satellitesNotLoaded, satellitesStore } from '$lib/derived/satellites.derived';
import { loadSettings, loadUserData } from '$lib/services/mission-control.services';
import { loadOrbiters } from '$lib/services/orbiters.services';
import { execute } from '$lib/services/progress.services';
import { loadSatellites } from '$lib/services/satellites.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Metadata } from '$lib/types/metadata';
import type { MissionControlId } from '$lib/types/mission-control';
import type { JunoModal, JunoModalCreateMonitoringStrategyDetail } from '$lib/types/modal';
import {
	type MonitoringStrategyProgress,
	MonitoringStrategyProgressStep
} from '$lib/types/progress-strategy';
import type { Option } from '$lib/types/utils';
import { isNotValidEmail } from '$lib/utils/email.utils';
import { emit } from '$lib/utils/events.utils';
import type { Principal } from '@dfinity/principal';
import {
	assertNonNullish,
	fromNullishNullable,
	isEmptyString,
	isNullish,
	nonNullish,
	notEmptyString,
	toNullable
} from '@dfinity/utils';
import { get } from 'svelte/store';

type MonitoringStrategyOnProgress = (progress: MonitoringStrategyProgress | undefined) => void;

interface MonitoringCyclesStrategyParams {
	identity: OptionIdentity;
	missionControlId: MissionControlId;
	satellites: Principal[];
	orbiters: Principal[];
	onProgress: MonitoringStrategyOnProgress;
}

export interface ApplyMonitoringCyclesStrategyOptions {
	monitoringConfig: MonitoringConfig | undefined;
	saveAsDefaultStrategy: boolean;
	metadata: Metadata;
	userEmail: Option<string>;
}

interface ApplyMonitoringCyclesStrategyParams extends MonitoringCyclesStrategyParams {
	minCycles: bigint | undefined;
	fundCycles: bigint | undefined;
	missionControlMonitored: boolean;
	missionControlMinCycles: bigint | undefined;
	missionControlFundCycles: bigint | undefined;
	reuseStrategy: CyclesMonitoringStrategy | undefined;
	options: ApplyMonitoringCyclesStrategyOptions | undefined;
}

interface StopMonitoringCyclesStrategyParams extends MonitoringCyclesStrategyParams {
	stopMissionControl: boolean | undefined;
}

export const applyMonitoringCyclesStrategy = async ({
	identity,
	missionControlId,
	onProgress,
	options,
	...rest
}: ApplyMonitoringCyclesStrategyParams): Promise<{
	success: 'ok' | 'cancelled' | 'error';
	err?: unknown;
}> => {
	const labels = get(i18n);

	const setMonitoringStrategy = async () => {
		await setMonitoringCyclesStrategy({
			identity,
			missionControlId,
			...rest
		});
	};

	const setMonitoringOptions = async () => {
		const { userEmail, metadata, saveAsDefaultStrategy, monitoringConfig } = options ?? {
			monitoringConfig: undefined,
			userEmail: null,
			metadata: [],
			saveAsDefaultStrategy: false
		};

		const withEmail = nonNullish(userEmail) && notEmptyString(userEmail);

		if (withEmail) {
			// For now, we use the mission control metadata email. We might allow dev in the future to specify various specific email.
			await setEmail({
				identity,
				missionControlId,
				userEmail,
				metadata
			});
		}

		if (saveAsDefaultStrategy || withEmail) {
			await setMonitoringCyclesConfig({
				identity,
				missionControlId,
				monitoringConfig,
				userEmail,
				saveAsDefaultStrategy,
				...rest
			});
		}
	};

	const executeCreateMonitoring = async () => {
		if (nonNullish(options)) {
			await execute({
				fn: setMonitoringOptions,
				onProgress,
				step: MonitoringStrategyProgressStep.Options
			});
		}

		await execute({
			fn: setMonitoringStrategy,
			onProgress,
			step: MonitoringStrategyProgressStep.CreateOrStopMonitoring
		});
	};

	return await executeMonitoring({
		identity,
		missionControlId,
		onProgress,
		fn: executeCreateMonitoring,
		errorText: labels.errors.monitoring_apply_strategy_error
	});
};

export const stopMonitoringCyclesStrategy = async ({
	identity,
	missionControlId,
	onProgress,
	...rest
}: StopMonitoringCyclesStrategyParams): Promise<{
	success: 'ok' | 'cancelled' | 'error';
	err?: unknown;
}> => {
	const labels = get(i18n);

	const stopMonitoring = async () => {
		await stopMonitoringCycles({
			identity,
			missionControlId,
			...rest
		});
	};

	const executeStopMonitoring = async () => {
		await execute({
			fn: stopMonitoring,
			onProgress,
			step: MonitoringStrategyProgressStep.CreateOrStopMonitoring
		});
	};

	return await executeMonitoring({
		identity,
		missionControlId,
		onProgress,
		fn: executeStopMonitoring,
		errorText: labels.errors.monitoring_stop_error
	});
};

const executeMonitoring = async ({
	identity,
	missionControlId,
	onProgress,
	fn,
	errorText
}: Pick<MonitoringCyclesStrategyParams, 'identity' | 'missionControlId' | 'onProgress'> & {
	fn: () => Promise<void>;
	errorText: string;
}): Promise<{
	success: 'ok' | 'cancelled' | 'error';
	err?: unknown;
}> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		await fn();

		const reload = async () => await reloadData({ identity, missionControlId });
		await execute({
			fn: reload,
			onProgress,
			step: MonitoringStrategyProgressStep.Reload
		});
	} catch (err: unknown) {
		toasts.error({
			text: errorText,
			detail: err
		});

		return { success: 'error', err };
	}

	return { success: 'ok' };
};

const setMonitoringCyclesStrategy = async ({
	identity,
	missionControlId,
	satellites,
	orbiters,
	minCycles,
	fundCycles,
	reuseStrategy,
	...missionControlRest
}: Omit<ApplyMonitoringCyclesStrategyParams, 'identity' | 'onProgress' | 'options'> &
	Required<Pick<ApplyMonitoringCyclesStrategyParams, 'identity'>>) => {
	const moduleMinCycles = reuseStrategy?.BelowThreshold.min_cycles ?? minCycles;
	const moduleFundCycles = reuseStrategy?.BelowThreshold.fund_cycles ?? fundCycles;

	if (isNullish(moduleMinCycles)) {
		throw new Error(get(i18n).monitoring.min_cycles_not_defined);
	}

	if (isNullish(moduleFundCycles)) {
		throw new Error(get(i18n).monitoring.fund_cycles_not_defined);
	}

	const missionControlStrategy = buildMissionControlStrategy({
		...missionControlRest,
		minCycles: moduleMinCycles,
		fundCycles: moduleFundCycles
	});

	const moduleStrategy: CyclesMonitoringStrategy = {
		BelowThreshold: {
			min_cycles: moduleMinCycles,
			fund_cycles: moduleFundCycles
		}
	};

	await updateAndStartMonitoring({
		identity,
		missionControlId,
		config: {
			cycles_config: toNullable({
				mission_control_strategy: toNullable(missionControlStrategy),
				satellites_strategy:
					satellites.length > 0
						? [
								{
									ids: satellites,
									strategy: moduleStrategy
								}
							]
						: [],
				orbiters_strategy:
					orbiters.length > 0
						? [
								{
									ids: orbiters,
									strategy: moduleStrategy
								}
							]
						: []
			})
		}
	});
};

const setEmail = async ({
	identity,
	missionControlId,
	userEmail,
	metadata
}: Pick<ApplyMonitoringCyclesStrategyParams, 'missionControlId'> &
	Required<Pick<ApplyMonitoringCyclesStrategyParams, 'identity'>> &
	Required<
		Omit<ApplyMonitoringCyclesStrategyOptions, 'saveAsDefaultStrategy' | 'monitoringConfig'>
	>) => {
	// Do nothing if no email is provided
	if (isNullish(userEmail) || isEmptyString(userEmail)) {
		return;
	}

	if (isNotValidEmail(userEmail)) {
		throw new Error(get(i18n).errors.invalid_email);
	}

	const updateData = new Map(metadata);
	updateData.set(METADATA_KEY_EMAIL, userEmail);

	await setMetadata({
		identity,
		missionControlId,
		metadata: Array.from(updateData)
	});
};

const setMonitoringCyclesConfig = async ({
	identity,
	missionControlId,
	minCycles,
	fundCycles,
	monitoringConfig,
	userEmail,
	saveAsDefaultStrategy
}: Pick<ApplyMonitoringCyclesStrategyParams, 'missionControlId' | 'minCycles' | 'fundCycles'> &
	Required<Pick<ApplyMonitoringCyclesStrategyParams, 'identity'>> &
	Required<
		Pick<
			ApplyMonitoringCyclesStrategyOptions,
			'monitoringConfig' | 'userEmail' | 'saveAsDefaultStrategy'
		>
	>) => {
	if (saveAsDefaultStrategy && isNullish(minCycles)) {
		throw new Error(get(i18n).monitoring.min_cycles_not_defined);
	}

	if (saveAsDefaultStrategy && isNullish(fundCycles)) {
		throw new Error(get(i18n).monitoring.fund_cycles_not_defined);
	}

	const currentCyclesConfig = fromNullishNullable(monitoringConfig?.cycles);

	// If a new email is provided, we activate the notification else we keep the current config
	const notification: [] | [DepositedCyclesEmailNotification] = nonNullish(userEmail)
		? toNullable({
				enabled: true,
				to: toNullable()
			})
		: (currentCyclesConfig?.notification ?? []);

	// If the strategy should be use as default, we update or insert the default strategy else we keep the current configuration regardless if set or not
	const default_strategy: [] | [CyclesMonitoringStrategy] =
		saveAsDefaultStrategy && nonNullish(minCycles) && nonNullish(fundCycles)
			? toNullable({
					BelowThreshold: {
						min_cycles: minCycles,
						fund_cycles: fundCycles
					}
				})
			: (currentCyclesConfig?.default_strategy ?? []);

	const updateMonitoringConfig: MonitoringConfig = {
		cycles: toNullable({
			notification,
			default_strategy
		})
	};

	const config: Config = {
		monitoring: toNullable(updateMonitoringConfig)
	};

	await setConfig({
		identity,
		missionControlId,
		config
	});
};

const stopMonitoringCycles = async ({
	identity,
	missionControlId,
	satellites,
	orbiters,
	stopMissionControl
}: Omit<StopMonitoringCyclesStrategyParams, 'identity' | 'onProgress'> &
	Required<Pick<StopMonitoringCyclesStrategyParams, 'identity'>>) => {
	await updateAndStopMonitoring({
		identity,
		missionControlId,
		config: {
			cycles_config: toNullable({
				try_mission_control: toNullable(stopMissionControl),
				satellite_ids: satellites.length > 0 ? toNullable(satellites) : [],
				orbiter_ids: orbiters.length > 0 ? toNullable(orbiters) : []
			})
		}
	});
};

const reloadData = async ({
	missionControlId,
	identity
}: Pick<ApplyMonitoringCyclesStrategyParams, 'missionControlId'> &
	Required<Pick<ApplyMonitoringCyclesStrategyParams, 'identity'>>) => {
	const reloadParams = {
		missionControlId,
		reload: true
	};

	await Promise.all([
		loadSatellites(reloadParams),
		loadOrbiters(reloadParams),
		loadSettings({
			...reloadParams,
			identity
		}),
		loadUserData({
			...reloadParams,
			identity
		})
	]);
};

const buildMissionControlStrategy = ({
	missionControlMonitored: monitored,
	missionControlMinCycles,
	missionControlFundCycles,
	minCycles,
	fundCycles
}: Pick<
	ApplyMonitoringCyclesStrategyParams,
	'missionControlMonitored' | 'missionControlMinCycles' | 'missionControlFundCycles'
> &
	Required<
		Pick<ApplyMonitoringCyclesStrategyParams, 'minCycles' | 'fundCycles'>
	>): CyclesMonitoringStrategy | null => {
	// We keep the same strategy if the user did not input new values
	if (monitored && isNullish(missionControlFundCycles) && isNullish(missionControlMinCycles)) {
		return null;
	}

	// Webstorm does not understand minCycles and fundCycles are safely TS defined here.
	assertNonNullish(minCycles);
	assertNonNullish(fundCycles);

	const BelowThreshold: CyclesThreshold = {
		min_cycles: missionControlMinCycles ?? minCycles,
		fund_cycles: missionControlFundCycles ?? fundCycles
	};

	return {
		BelowThreshold
	};
};

export const openMonitoringModal = ({
	type,
	missionControlId
}: {
	type: 'create_monitoring_strategy' | 'stop_monitoring_strategy';
	missionControlId: MissionControlId;
}) => {
	const $missionControlSettingsNotLoaded = get(missionControlSettingsNotLoaded);

	if ($missionControlSettingsNotLoaded) {
		toasts.warn(get(i18n).errors.mission_control_settings_not_loaded);
		return;
	}

	const $missionControlUserData = get(missionControlUserData);
	if (isNullish($missionControlUserData)) {
		toasts.warn(get(i18n).errors.mission_control_user_data_not_loaded);
		return;
	}

	const $satellitesNotLoaded = get(satellitesNotLoaded);
	if ($satellitesNotLoaded) {
		toasts.warn(get(i18n).errors.satellites_not_loaded);
		return;
	}

	const $orbiterNotLoaded = get(orbiterNotLoaded);
	if ($orbiterNotLoaded) {
		toasts.warn(get(i18n).errors.orbiter_not_loaded);
		return;
	}

	const $satellitesStore = get(satellitesStore);
	const $orbiterStore = get(orbiterStore);
	if (($satellitesStore ?? []).length === 0 && isNullish($orbiterStore)) {
		toasts.warn(get(i18n).errors.monitoring_no_modules);
		return;
	}

	const $missionControlSettings = get(missionControlSettings);

	emit<JunoModal<JunoModalCreateMonitoringStrategyDetail>>({
		message: 'junoModal',
		detail: {
			type,
			detail: {
				settings: $missionControlSettings,
				user: $missionControlUserData,
				missionControlId
			}
		}
	});
};

export const setMonitoringNotification = async ({
	identity,
	missionControlId,
	monitoringConfig,
	enabled
}: {
	identity: OptionIdentity;
	missionControlId: Option<Principal>;
	monitoringConfig: MonitoringConfig | undefined;
	enabled: boolean;
}): Promise<{ success: boolean }> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		assertNonNullish(missionControlId, get(i18n).errors.no_mission_control);

		const cycles = fromNullishNullable(monitoringConfig?.cycles);
		const notification = fromNullishNullable(cycles?.notification);

		const updateMonitoringConfig: MonitoringConfig = {
			...(nonNullish(monitoringConfig) && monitoringConfig),
			cycles: toNullable({
				notification: toNullable({
					to: notification?.to ?? toNullable(),
					enabled
				}),
				default_strategy: cycles?.default_strategy ?? toNullable()
			})
		};

		const config: Config = {
			monitoring: toNullable(updateMonitoringConfig)
		};

		await setConfig({
			identity,
			missionControlId,
			config
		});

		await loadUserData({
			identity,
			missionControlId,
			reload: true
		});

		return { success: true };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.monitoring_notifications_update
		});
		return { success: false };
	}
};
