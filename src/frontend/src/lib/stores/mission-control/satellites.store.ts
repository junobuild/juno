import type { MissionControlDid } from '$declarations';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';

export const satellitesUncertifiedStore = initUncertifiedStore<MissionControlDid.Satellite[]>();
