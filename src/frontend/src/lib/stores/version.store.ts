import type { SatelliteIdText } from '$lib/types/satellite';
import type { BuildType } from '@junobuild/admin';
import type { Readable } from 'svelte/store';
import { writable } from 'svelte/store';

export interface ReleaseVersion {
	current: string | undefined;
	release: string | undefined;
}

export interface ReleaseVersionSatellite extends ReleaseVersion {
	currentBuild?: string | undefined;
	build: BuildType;
}

export interface ReleasesVersion {
	satellites: Record<SatelliteIdText, ReleaseVersionSatellite | undefined>;
	missionControl: ReleaseVersion | undefined;
	orbiter: ReleaseVersion | undefined;
}

export interface VersionStore extends Readable<ReleasesVersion> {
	setMissionControl: (version: ReleaseVersion) => void;
	setSatellite: (params: {
		satelliteId: SatelliteIdText;
		version: ReleaseVersionSatellite | undefined;
	}) => void;
	setOrbiter: (version: ReleaseVersion) => void;
	reset: () => void;
}

const initVersionStore = (): VersionStore => {
	const INITIAL: ReleasesVersion = {
		satellites: {},
		missionControl: undefined,
		orbiter: undefined
	};

	const { subscribe, update, set } = writable<ReleasesVersion>(INITIAL);

	return {
		subscribe,

		setMissionControl(version: ReleaseVersion) {
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

		setOrbiter(version: ReleaseVersion) {
			update((state) => ({
				...state,
				orbiter: version
			}));
		},

		reset: () => set(INITIAL)
	};
};

export const versionStore = initVersionStore();
