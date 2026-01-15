import { orbitersUncertifiedStore } from '$lib/stores/mission-control/orbiter.store';
import { derived } from 'svelte/store';

export const mctrlOrbiters = derived(
	[orbitersUncertifiedStore],
	([$orbitersDataStore]) => $orbitersDataStore?.data
);

export const mctrlOrbiter = derived([mctrlOrbiters], ([$mctrlOrbiters]) => $mctrlOrbiters?.[0]);
