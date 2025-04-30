import type { OrbiterSatelliteConfig } from '$declarations/orbiter/orbiter.did';
import type { OrbiterIdText } from '$lib/types/orbiter';
import type { Principal } from '@dfinity/principal';
import { type Readable, writable } from 'svelte/store';

export type OrbiterConfigs = [Principal, OrbiterSatelliteConfig][];

export type OrbitersConfigsData = Record<OrbiterIdText, OrbiterConfigs>;

export interface OrbitersConfigsStore extends Readable<OrbitersConfigsData> {
	setConfigs: (params: { orbiterId: OrbiterIdText; configs: OrbiterConfigs }) => void;
	reset: () => void;
}

const initOrbitersConfigsStore = (): OrbitersConfigsStore => {
	const INITIAL: OrbitersConfigsData = {};

	const { subscribe, update, set } = writable<OrbitersConfigsData>(INITIAL);

	return {
		subscribe,

		setConfigs({ orbiterId, configs }) {
			update((state) => ({
				...state,
				[orbiterId]: configs
			}));
		},

		reset: () => set(INITIAL)
	};
};

export const orbitersConfigsStore = initOrbitersConfigsStore();
