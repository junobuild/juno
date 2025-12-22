import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
import { devId } from '$lib/derived/dev.derived';
import { balanceCertifiedStore } from '$lib/stores/wallet/balance.store';
import { isNullish, nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const devBalance = derived([balanceCertifiedStore, devId], ([$balanceStore, $devId]) =>
	nonNullish($devId) ? $balanceStore?.[$devId.toText()]?.data : undefined
);

export const missionControlBalance = derived(
	[balanceCertifiedStore, missionControlId],
	([$balanceStore, $missionControlId]) =>
		nonNullish($missionControlId) ? $balanceStore?.[$missionControlId.toText()]?.data : undefined
);

export const balance = derived(
	[devBalance, missionControlBalance],
	([$devBalance, $missionControlBalance]) => {
		if (isNullish($devBalance) && isNullish($missionControlBalance)) {
			return undefined;
		}

		return ($devBalance ?? 0n) + ($missionControlBalance ?? 0n);
	}
);

export const devBalanceOrZero = derived([devBalance], ([$devBalance]) => $devBalance ?? 0n);

export const missionControlBalanceOrZero = derived(
	[missionControlBalance],
	([$missionControlBalance]) => $missionControlBalance ?? 0n
);

export const balanceOrZero = derived([balance], ([$balance]) => $balance ?? 0n);

const balanceLoaded = derived(
	[balanceCertifiedStore],
	([$balanceStore]) => $balanceStore !== undefined
);

export const balanceNotLoaded = derived([balanceLoaded], ([$balanceLoaded]) => !$balanceLoaded);
