import { ufosUncertifiedStore } from '$lib/stores/mission-control/ufos.store';
import { sortUfos } from '$lib/utils/ufo.utils';
import { derived } from 'svelte/store';

export const mctrlUfos = derived(
	[ufosUncertifiedStore],
	([$ufosUncertifiedStore]) => $ufosUncertifiedStore?.data
);

export const mctrlSortedUfos = derived([mctrlUfos], ([$mctrlUfosStore]) =>
	($mctrlUfosStore ?? []).sort(sortUfos)
);
