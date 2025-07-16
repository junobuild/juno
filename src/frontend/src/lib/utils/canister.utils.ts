import type { CanisterDataInfo } from '$lib/types/canister';

export const freezingThresholdCycles = (canisterInfo: CanisterDataInfo | undefined): bigint =>
	((canisterInfo?.idleCyclesBurnedPerDay ?? 0n) *
		(canisterInfo?.settings.freezingThreshold ?? 0n)) /
	86_400n;
