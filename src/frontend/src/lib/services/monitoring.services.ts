import type {
	CyclesMonitoringStrategy,
	CyclesThreshold
} from '$declarations/mission_control/mission_control.did';
import { startMonitoringWithConfig } from '$lib/api/mission-control.api';
import { loadSettings } from '$lib/services/mission-control.services';
import { loadSatellites } from '$lib/services/satellites.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

interface ApplyMonitoringCyclesStrategyParams {
	identity: OptionIdentity;
	missionControlId: Principal;
	satellites: Principal[];
	orbiters: Principal[];
	minCycles: bigint | undefined;
	fundCycles: bigint | undefined;
	missionControlMonitored: boolean;
	missionControlMinCycles: bigint | undefined;
	missionControlFundCycles: bigint | undefined;
}

export const applyMonitoringCyclesStrategy = async ({
	identity,
	missionControlId,
	satellites,
	orbiters,
	minCycles: min_cycles,
	fundCycles: fund_cycles,
	...missionControlRest
}: ApplyMonitoringCyclesStrategyParams): Promise<{
	success: 'ok' | 'cancelled' | 'error';
	err?: unknown;
}> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		if (isNullish(min_cycles)) {
			toasts.error({
				text: get(i18n).monitoring.min_cycles_not_defined
			});

			return { success: 'error' };
		}

		if (isNullish(fund_cycles)) {
			toasts.error({
				text: get(i18n).monitoring.fund_cycles_not_defined
			});

			return { success: 'error' };
		}

		const missionControlStrategy = buildMissionControlStrategy({
			...missionControlRest,
			minCycles: min_cycles,
			fundCycles: fund_cycles
		});

		const moduleStrategy: CyclesMonitoringStrategy = {
			BelowThreshold: {
				min_cycles,
				fund_cycles
			}
		};

		await startMonitoringWithConfig({
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

		// We need to reload the settings
		await Promise.all([
			loadSatellites({
				missionControl: missionControlId,
				reload: true
			}),
			loadSettings({
				missionControlId,
				identity,
				reload: true
			})
		]);
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.monitoring_apply_strategy_error,
			detail: err
		});

		return { success: 'error', err };
	}

	return { success: 'ok' };
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
