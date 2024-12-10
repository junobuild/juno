import type { MissionControlSettings } from '$declarations/mission_control/mission_control.did';
import { initDataStore } from '$lib/stores/data.store';
import type { Principal } from '@dfinity/principal';
import { writable } from 'svelte/store';

export const missionControlStore = writable<Principal | undefined | null>(undefined);

export const missionControlSettingsStore = initDataStore<MissionControlSettings>();
