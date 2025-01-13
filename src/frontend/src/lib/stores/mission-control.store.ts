import type {
	MissionControlSettings,
	User
} from '$declarations/mission_control/mission_control.did';
import { initDataStore } from '$lib/stores/_data.store';
import type { Principal } from '@dfinity/principal';

export const missionControlIdDataStore = initDataStore<Principal>();

export const missionControlUserDataStore = initDataStore<User>();

export const missionControlSettingsDataStore = initDataStore<MissionControlSettings | undefined>();
