import type { SatelliteIdText } from '$lib/types/satellite';
import type { SatelliteVersionMetadata, VersionMetadata } from '$lib/types/version';
import { type Readable, writable } from 'svelte/store';

export interface VersionStoreData {
	satellites: Record<SatelliteIdText, SatelliteVersionMetadata | undefined | null>;
	missionControl: Option<VersionMetadata>;
	orbiter: Option<VersionMetadata>;
}

export interface VersionStore extends Readable<VersionStoreData> {
	setMissionControl: (version: VersionMetadata | null) => void;
	setSatellite: (params: {
		satelliteId: SatelliteIdText;
		version: Option<SatelliteVersionMetadata>;
	}) => void;
	setOrbiter: (version: VersionMetadata | null) => void;
	reset: () => void;
}

const initVersionStore = (): VersionStore => {
	const INITIAL: VersionStoreData = {
		satellites: {},
		missionControl: undefined,
		orbiter: undefined
	};

	const { subscribe, update, set } = writable<VersionStoreData>(INITIAL);

	return {
		subscribe,

		setMissionControl(version) {
			update((state) => ({
				...state,
				missionControl: version
			}));
		},

		setSatellite({ satelliteId, version }) {
			update((state) => ({
				...state,
				satellites: {
					...state.satellites,
					[satelliteId]: version
				}
			}));
		},

		setOrbiter(version) {
			update((state) => ({
				...state,
				orbiter: version
			}));
		},

		reset: () => set(INITIAL)
	};
};

export const versionStore = initVersionStore();
