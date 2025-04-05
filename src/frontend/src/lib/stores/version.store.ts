import type { SatelliteIdText } from '$lib/types/satellite';
import type { BuildType } from '@junobuild/admin';
import { writable, type Readable } from 'svelte/store';

export interface VersionMetadata {
	release: string | undefined;
	current: string | undefined;
}

export interface SatelliteVersionMetadata extends VersionMetadata {
	currentBuild?: string | undefined;
	build: BuildType;
}

export interface VersionStoreData {
	satellites: Record<SatelliteIdText, SatelliteVersionMetadata | undefined>;
	missionControl: VersionMetadata | undefined;
	orbiter: VersionMetadata | undefined;
}

export interface VersionStore extends Readable<VersionStoreData> {
	setMissionControl: (version: VersionMetadata) => void;
	setSatellite: (params: {
		satelliteId: SatelliteIdText;
		version: SatelliteVersionMetadata | undefined;
	}) => void;
	setOrbiter: (version: VersionMetadata) => void;
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

		setMissionControl(version: VersionMetadata) {
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

		setOrbiter(version: VersionMetadata) {
			update((state) => ({
				...state,
				orbiter: version
			}));
		},

		reset: () => set(INITIAL)
	};
};

export const versionStore = initVersionStore();
