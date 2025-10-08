import { initUncertifiedStore } from '$lib/stores/_uncertified.store';
import type { MissionControlDid } from '$lib/types/declarations';

export const orbitersUncertifiedStore = initUncertifiedStore<MissionControlDid.Orbiter[]>();
