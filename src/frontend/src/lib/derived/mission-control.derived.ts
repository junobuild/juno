import { missionControlDataStore } from '$lib/stores/mission-control.store';
import { derived } from 'svelte/store';

export const missionControlStore = derived(
	[missionControlDataStore],
	([$missionControlDataStore]) => $missionControlDataStore
);
