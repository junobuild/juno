import type { MissionControlSettings } from '$declarations/mission_control/mission_control.did';
import { initDataStore } from '$lib/stores/data.store';
import type { Metadata } from '$lib/types/metadata';
import type { Principal } from '@dfinity/principal';

export const missionControlIdDataStore = initDataStore<Principal>();

export const missionControlMetadataDataStore = initDataStore<Metadata>();

export const missionControlSettingsDataStore = initDataStore<MissionControlSettings | undefined>();
