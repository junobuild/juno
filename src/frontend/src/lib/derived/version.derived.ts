import { type VersionMetadata, versionStore } from '$lib/stores/version.store';
import { derived, type Readable } from 'svelte/store';

export const missionControlVersion: Readable<VersionMetadata | undefined> = derived(
	[versionStore],
	([$versionStore]) => $versionStore?.missionControl
);
