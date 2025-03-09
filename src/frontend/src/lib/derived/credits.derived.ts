import { creditsUncertifiedStore } from '$lib/stores/credits.store';
import { derived } from 'svelte/store';

export const credits = derived([creditsUncertifiedStore], ([$creditsStore]) => $creditsStore?.data);

export const creditsOrZero = derived(
	[creditsUncertifiedStore],
	([$creditsStore]) => $creditsStore?.data ?? 0n
);
