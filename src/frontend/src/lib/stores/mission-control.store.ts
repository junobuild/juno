import type {
	MissionControlSettings,
	User
} from '$declarations/mission_control/mission_control.did';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';
import type { Principal } from '@dfinity/principal';

export const missionControlIdDataStore = initUncertifiedStore<Principal>();

export const missionControlUserDataStore = initUncertifiedStore<User>();

export const missionControlSettingsDataStore = initUncertifiedStore<
	MissionControlSettings | undefined
>();
