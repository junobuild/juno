import { balanceCertifiedStore } from '$lib/stores/balance.store';
import { derived } from 'svelte/store';

export const balance = derived([balanceCertifiedStore], ([$balanceStore]) => $balanceStore?.data);

export const balanceOrZero = derived(
	[balanceCertifiedStore],
	([$balanceStore]) => $balanceStore?.data ?? 0n
);

export const balanceLoaded = derived(
	[balanceCertifiedStore],
	([$balanceStore]) => $balanceStore !== undefined
);

export const balanceNotLoaded = derived([balanceLoaded], ([$balanceLoaded]) => !$balanceLoaded);
