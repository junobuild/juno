import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
import { devId } from '$lib/derived/dev.derived';
import { balanceCertifiedStore } from '$lib/stores/wallet/balance.store';
import { isNullish, nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const balance = derived(
	[balanceCertifiedStore, missionControlId, devId],
	([$balanceStore, $missionControlId, $devId]) => {
		const devBalance = nonNullish($devId) ? $balanceStore?.[$devId.toText()]?.data : undefined;
		const missionControlBalance = nonNullish($missionControlId)
			? $balanceStore?.[$missionControlId.toText()]?.data
			: undefined;

		return (devBalance ?? 0n) + (missionControlBalance ?? 0n);
	}
);

export const balanceOrZero = derived([balance], ([$balance]) => $balance ?? 0n);

export const balanceLoaded = derived(
	[balanceCertifiedStore],
	([$balanceStore]) => $balanceStore !== undefined
);

export const balanceNotLoaded = derived([balanceLoaded], ([$balanceLoaded]) => !$balanceLoaded);
