import type { CyclesMonitoringStrategy } from '$declarations/mission_control/mission_control.did';
import { CYCLES_WARNING } from '$lib/constants/app.constants';

export const EMAIL_PLACEHOLDER = 'name@example.com';

export const BASIC_STRATEGY: CyclesMonitoringStrategy = {
	BelowThreshold: {
		fund_cycles: 100_000_000_000n,
		min_cycles: CYCLES_WARNING
	}
};
