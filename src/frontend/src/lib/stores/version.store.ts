import type { VersionRegistry } from '$lib/types/version';
import { type Readable, writable } from 'svelte/store';

export type VersionStoreData = VersionRegistry;

export interface VersionStore extends Readable<VersionStoreData> {
	setAll: (state: VersionStoreData) => void;
	reset: () => void;
}

const initVersionStore = (): VersionStore => {
	const INITIAL: VersionStoreData = {
		satellites: {},
		missionControl: undefined,
		orbiter: undefined
	};

	const { subscribe, set } = writable<VersionStoreData>(INITIAL);

	return {
		subscribe,

		setAll(state) {
			set(state);
		},

		reset: () => set(INITIAL)
	};
};

export const versionStore = initVersionStore();
