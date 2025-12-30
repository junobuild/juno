import { CYCLES_LEDGER_CANISTER_ID, ICP_LEDGER_CANISTER_ID } from '$lib/constants/app.constants';
import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
import { devId } from '$lib/derived/dev.derived';
import { icpToCyclesRate } from '$lib/derived/wallet/rate.derived';
import { balanceCertifiedStore } from '$lib/stores/wallet/balance.store';
import { icpE8sToCycles } from '$lib/utils/cycles.utils';
import { isNullish, nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const devCyclesBalance = derived(
	[balanceCertifiedStore, devId],
	([$balanceStore, $devId]) =>
		nonNullish($devId)
			? $balanceStore?.[$devId.toText()]?.[CYCLES_LEDGER_CANISTER_ID]?.data
			: undefined
);

export const devIcpBalance = derived([balanceCertifiedStore, devId], ([$balanceStore, $devId]) =>
	nonNullish($devId) ? $balanceStore?.[$devId.toText()]?.[ICP_LEDGER_CANISTER_ID]?.data : undefined
);

export const missionControlIcpBalance = derived(
	[balanceCertifiedStore, missionControlId],
	([$balanceStore, $missionControlId]) =>
		nonNullish($missionControlId)
			? $balanceStore?.[$missionControlId.toText()]?.[ICP_LEDGER_CANISTER_ID]?.data
			: undefined
);

export const missionControlIcpToCyclesBalance = derived(
	[missionControlIcpBalance, icpToCyclesRate],
	([$missionControlIcpBalance, $icpToCyclesRate]) =>
		nonNullish($missionControlIcpBalance) && nonNullish($icpToCyclesRate)
			? icpE8sToCycles({
					icpE8s: $missionControlIcpBalance,
					trillionRatio: $icpToCyclesRate
				})
			: undefined
);

export const missionControlCyclesBalance = derived(
	[balanceCertifiedStore, missionControlId],
	([$balanceStore, $missionControlId]) =>
		nonNullish($missionControlId)
			? $balanceStore?.[$missionControlId.toText()]?.[CYCLES_LEDGER_CANISTER_ID]?.data
			: undefined
);

export const balance = derived(
	[devCyclesBalance, missionControlCyclesBalance, missionControlIcpToCyclesBalance],
	([$devCyclesBalance, $missionControlCyclesBalance, $missionControlIcpToCyclesBalance]) => {
		if (
			isNullish($devCyclesBalance) &&
			isNullish($missionControlCyclesBalance) &&
			isNullish($missionControlIcpToCyclesBalance)
		) {
			return undefined;
		}

		return (
			($devCyclesBalance ?? 0n) +
			($missionControlCyclesBalance ?? 0n) +
			($missionControlIcpToCyclesBalance ?? 0n)
		);
	}
);

export const devCyclesBalanceOrZero = derived(
	[devCyclesBalance],
	([$devCyclesBalance]) => $devCyclesBalance ?? 0n
);

const devIcpBalanceOrZero = derived([devIcpBalance], ([$devIcpBalance]) => $devIcpBalance ?? 0n);

export const missionControlIcpBalanceOrZero = derived(
	[missionControlIcpBalance],
	([$missionControlIcpBalance]) => $missionControlIcpBalance ?? 0n
);

export const devHasIcp = derived(
	[devIcpBalanceOrZero],
	([$devIcpBalanceOrZero]) => $devIcpBalanceOrZero > 0n
);

export const missionControlHasIcp = derived(
	[missionControlIcpBalanceOrZero],
	([$missionControlIcpBalanceOrZero]) => $missionControlIcpBalanceOrZero > 0n
);

const balanceLoaded = derived(
	[balanceCertifiedStore],
	([$balanceStore]) => $balanceStore !== undefined
);

export const balanceNotLoaded = derived([balanceLoaded], ([$balanceLoaded]) => !$balanceLoaded);
