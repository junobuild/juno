import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';

export const orbitersDataStore = initUncertifiedStore<Orbiter[]>();
