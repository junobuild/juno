import type { MissionControlDid } from '$declarations';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';

export const missionControlUserUncertifiedStore = initUncertifiedStore<MissionControlDid.User>();

export const missionControlSettingsUncertifiedStore = initUncertifiedStore<
	MissionControlDid.MissionControlSettings | undefined
>();
