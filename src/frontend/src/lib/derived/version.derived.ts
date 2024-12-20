import { type ReleaseVersion, versionStore } from '$lib/stores/version.store';
import { derived, type Readable } from 'svelte/store';

export const missionControlVersion: Readable<ReleaseVersion | undefined> = derived(
	[versionStore],
	([$versionStore]) => $versionStore?.missionControl
);
