import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { derived, writable, type Readable } from 'svelte/store';

export const orbitersStore = writable<Orbiter[] | undefined | null>(undefined);

export const orbiterStore: Readable<Orbiter | undefined | null> = derived(
	[orbitersStore],
	([orbiterStore]) => orbiterStore?.[0]
);
