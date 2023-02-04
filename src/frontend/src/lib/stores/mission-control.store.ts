import type { Principal } from '@dfinity/principal';
import { writable } from 'svelte/store';

export const missionControlStore = writable<Principal | undefined | null>(undefined);
