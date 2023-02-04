import { writable } from 'svelte/store';

export interface ReleaseVersion {
	current: string | undefined;
	release: string | undefined;
}

export interface ReleasesVersion {
	satellite?: ReleaseVersion;
	missionControl: ReleaseVersion;
}

export const versionStore = writable<ReleasesVersion | undefined>(undefined);
