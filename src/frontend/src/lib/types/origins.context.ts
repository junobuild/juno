import type { OriginConfig } from '$declarations/orbiter/orbiter.did';
import type { Principal } from '@dfinity/principal';
import type { Writable } from 'svelte/store';

export type OriginsStoreData = [Principal, OriginConfig][] | undefined;

export interface OriginsContext {
	store: Writable<OriginsStoreData>;
}

export const ORIGINS_CONTEXT_KEY = Symbol('origins');
