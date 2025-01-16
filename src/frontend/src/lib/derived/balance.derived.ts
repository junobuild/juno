import { balanceStore } from '$lib/stores/balance.store';
import { derived } from 'svelte/store';

export const balance = derived([balanceStore], ([$balanceStore]) => $balanceStore?.data);

export const balanceOrZero = derived(
	[balanceStore],
	([$balanceStore]) => $balanceStore?.data ?? 0n
);

export const balanceLoaded = derived(
	[balanceStore],
	([$balanceStore]) => $balanceStore !== undefined
);

export const balanceNotLoaded = derived([balanceLoaded], ([$balanceLoaded]) => !$balanceLoaded);
