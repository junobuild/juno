import { derived } from 'svelte/store';
import { orbitersUncertifiedStore } from '$lib/stores/mission-control/orbiter.store';

export const mctrlOrbiters = derived(
	[orbitersUncertifiedStore],
	([$orbitersDataStore]) => $orbitersDataStore?.data
);