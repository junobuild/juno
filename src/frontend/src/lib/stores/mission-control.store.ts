import { initDataStore } from '$lib/stores/data.store';
import type { Principal } from '@dfinity/principal';

export const missionControlStore = initDataStore<Principal>();
