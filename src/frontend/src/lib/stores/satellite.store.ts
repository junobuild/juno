import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';

export const satellitesDataStore = initUncertifiedStore<Satellite[]>();
