import { ONE_DAY } from '$lib/constants/canister.constants';
import type { CanisterDataInfo } from '$lib/types/canister';

export const cyclesNeededForFreezingThreshold = (
	canisterInfo: CanisterDataInfo | undefined
): bigint =>
	((canisterInfo?.idleCyclesBurnedPerDay ?? 0n) *
		(canisterInfo?.settings.freezingThreshold ?? 0n)) /
	ONE_DAY;

export const lacksCyclesForFreezingThreshold = (params: {
	canisterInfo: CanisterDataInfo;
	freezingThreshold: bigint;
}): boolean => !hasEnoughCyclesForFreezingThreshold(params);

export const hasEnoughCyclesForFreezingThreshold = ({
	canisterInfo,
	freezingThreshold
}: {
	canisterInfo: CanisterDataInfo;
	freezingThreshold: bigint;
}): boolean =>
	canisterInfo.cycles >=
	((canisterInfo.idleCyclesBurnedPerDay ?? 0n) * freezingThreshold) / ONE_DAY;
