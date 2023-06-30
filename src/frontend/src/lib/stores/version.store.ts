import type { SatelliteIdText } from '$lib/types/satellite';
import type { Readable } from 'svelte/store';
import { writable } from 'svelte/store';

export interface ReleaseVersion {
	current: string | undefined;
	release: string | undefined;
}

export interface ReleasesVersion {
	satellites: Record<SatelliteIdText, ReleaseVersion | undefined>;
	missionControl: ReleaseVersion | undefined;
}

export interface VersionStore extends Readable<ReleasesVersion> {
	setMissionControl: (version: ReleaseVersion) => void;
	setSatellite: (params: {
		satelliteId: SatelliteIdText;
		version: ReleaseVersion | undefined;
	}) => void;
}

const initVersionStore = (): VersionStore => {
	const { subscribe, update } = writable<ReleasesVersion>({
		satellites: {},
		missionControl: undefined
	});

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
		}
	};
};

export const versionStore = initVersionStore();
