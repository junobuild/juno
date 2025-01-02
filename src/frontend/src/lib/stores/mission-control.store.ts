import type { MissionControl } from '$declarations/console/console.did';
import type { MissionControlSettings } from '$declarations/mission_control/mission_control.did';
import { initDataStore } from '$lib/stores/data.store';

export const missionControlDataStore = initDataStore<MissionControl>();

export const missionControlSettingsDataStore = initDataStore<MissionControlSettings | undefined>();
