import { creditsDataStore } from '$lib/stores/credits.store';
import { derived } from 'svelte/store';

export const credits = derived([creditsDataStore], ([$creditsStore]) => $creditsStore?.data);

export const creditsOrZero = derived(
	[creditsDataStore],
	([$creditsStore]) => $creditsStore?.data ?? 0n
);
