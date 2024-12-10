import type { MissionControlSettings } from '$declarations/mission_control/mission_control.did';
import type { Principal } from '@dfinity/principal';
import { writable } from 'svelte/store';

export const missionControlStore = writable<Principal | undefined | null>(undefined);

export const missionControlSettingsStore = writable<MissionControlSettings | undefined | null>(
	undefined
);
