import { initCertifiedStore } from '$lib/stores/_certified.store';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';
import type { MissionControlDid } from '$lib/types/declarations';
import type { MissionControlId } from '$lib/types/mission-control';

export const missionControlIdCertifiedStore = initCertifiedStore<MissionControlId>();

export const missionControlUserUncertifiedStore = initUncertifiedStore<MissionControlDid.User>();

export const missionControlSettingsUncertifiedStore = initUncertifiedStore<
	MissionControlDid.MissionControlSettings | undefined
>();
