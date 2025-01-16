import type {
	MissionControlSettings,
	User
} from '$declarations/mission_control/mission_control.did';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';
import type { Principal } from '@dfinity/principal';

export const missionControlIdUncertifiedStore = initUncertifiedStore<Principal>();

export const missionControlUncertifiedStore = initUncertifiedStore<User>();

export const missionControlSettingsUncertifiedStore = initUncertifiedStore<
	MissionControlSettings | undefined
>();
