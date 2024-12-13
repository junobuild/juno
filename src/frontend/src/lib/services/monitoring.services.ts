import type {
	CyclesMonitoringStrategy,
	CyclesThreshold
} from '$declarations/mission_control/mission_control.did';
import { startMonitoringWithConfig } from '$lib/api/mission-control.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

export const applyMonitoringCyclesStrategy = async ({
	identity,
	missionControlId,
	selectedMissionControl,
	satellites,
	orbiters,
	minCycles: min_cycles,
	fundCycles: fund_cycles
}: {
	identity: OptionIdentity;
	missionControlId: Principal;
	selectedMissionControl: boolean;
	satellites: Principal[];
	orbiters: Principal[];
	minCycles: bigint;
	fundCycles: bigint;
}): Promise<{
	success: 'ok' | 'cancelled' | 'error';
	err?: unknown;
}> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		// TODO: mission control version check

		const BelowThreshold: CyclesThreshold = {
			min_cycles,
			fund_cycles
		};

		const strategy: CyclesMonitoringStrategy = {
			BelowThreshold
		};

		await startMonitoringWithConfig({
			identity,
			missionControlId,
			config: {
				cycles_config: toNullable({
					mission_control_strategy: selectedMissionControl ? toNullable({ BelowThreshold }) : [],
					satellites_strategy:
						satellites.length > 0
							? [
									{
										ids: satellites,
										strategy
									}
								]
							: [],
					orbiters_strategy:
						orbiters.length > 0
							? [
									{
										ids: orbiters,
										strategy
									}
								]
							: []
				})
			}
		});
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
