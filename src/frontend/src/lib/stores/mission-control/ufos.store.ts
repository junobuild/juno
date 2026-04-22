import type { MissionControlDid } from '$declarations';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';

export const ufosUncertifiedStore = initUncertifiedStore<MissionControlDid.Ufo[] | null>();
