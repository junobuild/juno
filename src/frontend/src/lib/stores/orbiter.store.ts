import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { initDataStore } from '$lib/stores/_data.store';

export const orbitersDataStore = initDataStore<Orbiter[]>();
