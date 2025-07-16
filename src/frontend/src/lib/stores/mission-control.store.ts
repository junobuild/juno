import type {
	MissionControlSettings,
	User
} from '$declarations/mission_control/mission_control.did';
import { initCertifiedStore } from '$lib/stores/_certified.store';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';
import type { MissionControlId } from '$lib/types/mission-control';

export const missionControlIdCertifiedStore = initCertifiedStore<MissionControlId>();

export const missionControlUserUncertifiedStore = initUncertifiedStore<User>();

export const missionControlSettingsUncertifiedStore = initUncertifiedStore<
	MissionControlSettings | undefined
>();
