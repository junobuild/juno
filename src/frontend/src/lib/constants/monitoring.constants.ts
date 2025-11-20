import type { MissionControlDid } from '$declarations';
import { CYCLES_WARNING } from '$lib/constants/app.constants';

export const EMAIL_PLACEHOLDER = 'name@example.com';

export const BASIC_STRATEGY: MissionControlDid.CyclesMonitoringStrategy = {
	BelowThreshold: {
		fund_cycles: 100_000_000_000n,
		min_cycles: CYCLES_WARNING
	}
};
