import type { MissionControlSettings } from '$declarations/mission_control/mission_control.did';
import { initDataStore } from '$lib/stores/data.store';
import type { Principal } from '@dfinity/principal';

export const missionControlDataStore = initDataStore<Principal>();

export const missionControlSettingsDataStore = initDataStore<MissionControlSettings | undefined>();
