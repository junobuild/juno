import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { writable } from 'svelte/store';

export const orbitersStore = writable<Orbiter[] | undefined | null>(undefined);
