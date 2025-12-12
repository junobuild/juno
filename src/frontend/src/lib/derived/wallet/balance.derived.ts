import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
import { balanceCertifiedStore } from '$lib/stores/wallet/balance.store';
import { nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const balance = derived(
	[balanceCertifiedStore, missionControlId],
	([$balanceStore, $missionControlId]) => {
		const missionControlBalance = nonNullish($missionControlId)
			? $balanceStore?.[$missionControlId.toText()]?.data
			: undefined;

		return missionControlBalance ?? 0n;
	}
);

export const balanceOrZero = derived([balance], ([$balance]) => $balance ?? 0n);

export const balanceLoaded = derived(
	[balanceCertifiedStore],
	([$balanceStore]) => $balanceStore !== undefined
);

export const balanceNotLoaded = derived([balanceLoaded], ([$balanceLoaded]) => !$balanceLoaded);
