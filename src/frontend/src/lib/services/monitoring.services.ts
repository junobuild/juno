import type {
	CyclesMonitoringStrategy,
	CyclesThreshold,
	MonitoringConfig
} from '$declarations/mission_control/mission_control.did';
import {
	setMonitoringConfig as setMonitoringConfigApi,
	setUserMetadata,
	updateAndStartMonitoring,
	updateAndStopMonitoring
} from '$lib/api/mission-control.api';
import { METADATA_KEY_EMAIL } from '$lib/constants/metadata.constants';
import { orbiterNotLoaded, orbiterStore } from '$lib/derived/orbiter.derived';
import { satellitesNotLoaded, satellitesStore } from '$lib/derived/satellite.derived';
import { loadSettings, loadUserMetadata } from '$lib/services/mission-control.services';
import { loadOrbiters } from '$lib/services/orbiters.services';
import { loadSatellites } from '$lib/services/satellites.services';
import { i18n } from '$lib/stores/i18n.store';
import {
	missionControlMetadataDataStore,
	missionControlSettingsDataStore
} from '$lib/stores/mission-control.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Metadata } from '$lib/types/metadata';
import {
	type MonitoringStrategyProgress,
	MonitoringStrategyProgressStep
} from '$lib/types/strategy';
import type { Option } from '$lib/types/utils';
import { isNotValidEmail } from '$lib/utils/email.utils';
import { emit } from '$lib/utils/events.utils';
import type { Principal } from '@dfinity/principal';
import {
	assertNonNullish,
	isNullish,
	nonNullish,
	notEmptyString,
	toNullable
} from '@dfinity/utils';
import { get } from 'svelte/store';

type MonitoringStrategyOnProgress = (progress: MonitoringStrategyProgress | undefined) => void;

interface MonitoringCyclesStrategyParams {
	identity: OptionIdentity;
	missionControlId: Principal;
	satellites: Principal[];
	orbiters: Principal[];
	onProgress: MonitoringStrategyOnProgress;
}

export interface ApplyMonitoringCyclesStrategyOptions {
	useAsDefaultStrategy: boolean;
	userMetadata: Metadata;
	userEmail: Option<string>;
}

interface ApplyMonitoringCyclesStrategyParams extends MonitoringCyclesStrategyParams {
	minCycles: bigint | undefined;
	fundCycles: bigint | undefined;
	missionControlMonitored: boolean;
	missionControlMinCycles: bigint | undefined;
	missionControlFundCycles: bigint | undefined;
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
		const { userEmail, userMetadata, useAsDefaultStrategy } = options ?? {
			userEmail: null,
			userMetadata: [],
			useAsDefaultStrategy: false
		};

		const withEmail = nonNullish(userEmail) && notEmptyString(userEmail);

		if (withEmail) {
			// For now, we use the mission control metadata email. We might allow dev in the future to specify various specific email.
			await setEmail({
				identity,
				missionControlId,
				userEmail,
				userMetadata
			});
		}

		if (useAsDefaultStrategy) {
			await setMonitoringCyclesConfig({
				identity,
				missionControlId,
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
	...missionControlRest
}: Omit<ApplyMonitoringCyclesStrategyParams, 'identity' | 'onProgress' | 'options'> &
	Required<Pick<ApplyMonitoringCyclesStrategyParams, 'identity'>>) => {
	if (isNullish(minCycles)) {
		throw new Error(get(i18n).monitoring.min_cycles_not_defined);
	}

	if (isNullish(fundCycles)) {
		throw new Error(get(i18n).monitoring.fund_cycles_not_defined);
	}

	const missionControlStrategy = buildMissionControlStrategy({
		...missionControlRest,
		minCycles,
		fundCycles
	});

	const moduleStrategy: CyclesMonitoringStrategy = {
		BelowThreshold: {
			min_cycles: minCycles,
			fund_cycles: fundCycles
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
	userMetadata
}: Pick<ApplyMonitoringCyclesStrategyParams, 'missionControlId'> &
	Required<Pick<ApplyMonitoringCyclesStrategyParams, 'identity'>> &
	Required<Omit<ApplyMonitoringCyclesStrategyOptions, 'useAsDefaultStrategy'>>) => {
	// Do nothing if no email is provided
	if (isNullish(userEmail) || !notEmptyString(userEmail)) {
		return;
	}

	if (isNotValidEmail(userEmail)) {
		throw new Error(get(i18n).errors.invalid_email);
	}

	const updateData = new Map(userMetadata);
	updateData.set(METADATA_KEY_EMAIL, userEmail);

	await setUserMetadata({
		identity,
		missionControlId,
		metadata: Array.from(updateData)
	});
};

const setMonitoringCyclesConfig = async ({
	identity,
	missionControlId,
	minCycles,
	fundCycles
}: Pick<ApplyMonitoringCyclesStrategyParams, 'missionControlId' | 'minCycles' | 'fundCycles'> &
	Required<Pick<ApplyMonitoringCyclesStrategyParams, 'identity'>>) => {
	if (isNullish(minCycles)) {
		throw new Error(get(i18n).monitoring.min_cycles_not_defined);
	}

	if (isNullish(fundCycles)) {
		throw new Error(get(i18n).monitoring.fund_cycles_not_defined);
	}

	const config: MonitoringConfig = {
		cycles: toNullable({
			notification: toNullable(),
			default_strategy: toNullable({
				BelowThreshold: {
					min_cycles: minCycles,
					fund_cycles: fundCycles
				}
			})
		})
	};

	await setMonitoringConfigApi({
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
		missionControl: missionControlId,
		reload: true
	};

	await Promise.all([
		loadSatellites(reloadParams),
		loadOrbiters(reloadParams),
		loadSettings({
			...reloadParams,
			identity
		}),
		loadUserMetadata({
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

const execute = async ({
	fn,
	step,
	onProgress
}: {
	fn: () => Promise<void>;
	step: MonitoringStrategyProgressStep;
	onProgress: MonitoringStrategyOnProgress;
}) => {
	onProgress({
		step,
		state: 'in_progress'
	});

	try {
		await fn();

		onProgress({
			step,
			state: 'success'
		});
	} catch (err: unknown) {
		onProgress({
			step,
			state: 'error'
		});

		throw err;
	}
};

export const openMonitoringModal = ({
	type,
	missionControlId
}: {
	type: 'create_monitoring_strategy' | 'stop_monitoring_strategy';
	missionControlId: Principal;
}) => {
	const $missionControlSettingsDataStore = get(missionControlSettingsDataStore);
	if (isNullish($missionControlSettingsDataStore)) {
		toasts.warn(get(i18n).errors.mission_control_settings_not_loaded);
		return;
	}

	const $missionControlMetadataDataStore = get(missionControlMetadataDataStore);
	if (isNullish($missionControlMetadataDataStore)) {
		toasts.warn(get(i18n).errors.mission_control_metadata_not_loaded);
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

	emit({
		message: 'junoModal',
		detail: {
			type,
			detail: {
				settings: $missionControlSettingsDataStore.data,
				userMetadata: $missionControlMetadataDataStore.data,
				missionControlId
			}
		}
	});
};
