import type {
	CyclesMonitoringStrategy,
	CyclesThreshold
} from '$declarations/mission_control/mission_control.did';
import { updateAndStartMonitoring, updateAndStopMonitoring } from '$lib/api/mission-control.api';
import { loadSettings } from '$lib/services/mission-control.services';
import { loadOrbiters } from '$lib/services/orbiters.services';
import { loadSatellites } from '$lib/services/satellites.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import {
	type MonitoringStrategyProgress,
	MonitoringStrategyProgressStep
} from '$lib/types/strategy';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

type MonitoringStrategyOnProgress = (progress: MonitoringStrategyProgress | undefined) => void;

interface MonitoringCyclesStrategyParams {
	identity: OptionIdentity;
	missionControlId: Principal;
	satellites: Principal[];
	orbiters: Principal[];
	onProgress: MonitoringStrategyOnProgress;
}

interface ApplyMonitoringCyclesStrategyParams extends MonitoringCyclesStrategyParams {
	minCycles: bigint | undefined;
	fundCycles: bigint | undefined;
	missionControlMonitored: boolean;
	missionControlMinCycles: bigint | undefined;
	missionControlFundCycles: bigint | undefined;
}

interface StopMonitoringCyclesStrategyParams extends MonitoringCyclesStrategyParams {
	stopMissionControl: boolean | undefined;
}

export const applyMonitoringCyclesStrategy = async ({
	identity,
	missionControlId,
	onProgress,
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

	return await executeMonitoring({
		identity,
		missionControlId,
		onProgress,
		fn: setMonitoringStrategy,
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

	return await executeMonitoring({
		identity,
		missionControlId,
		onProgress,
		fn: stopMonitoring,
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

		await execute({
			fn,
			onProgress,
			step: MonitoringStrategyProgressStep.CreateOrStopMonitoring
		});

		const reload = async () => await reloadSettings({ identity, missionControlId });
		await execute({
			fn: reload,
			onProgress,
			step: MonitoringStrategyProgressStep.ReloadSettings
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
}: Omit<ApplyMonitoringCyclesStrategyParams, 'identity' | 'onProgress'> &
	Required<Pick<ApplyMonitoringCyclesStrategyParams, 'identity'>>) => {
	if (isNullish(minCycles)) {
		toasts.error({
			text: get(i18n).monitoring.min_cycles_not_defined
		});

		return { success: 'error' };
	}

	if (isNullish(fundCycles)) {
		toasts.error({
			text: get(i18n).monitoring.fund_cycles_not_defined
		});

		return { success: 'error' };
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

const reloadSettings = async ({
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
