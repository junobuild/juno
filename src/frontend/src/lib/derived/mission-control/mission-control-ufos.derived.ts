import { ufosUncertifiedStore } from '$lib/stores/mission-control/ufos.store';
import { derived } from 'svelte/store';

export const mctrlUfos = derived(
	[ufosUncertifiedStore],
	([$ufosUncertifiedStore]) => $ufosUncertifiedStore?.data
);
