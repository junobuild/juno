import { versionStore } from '$lib/stores/version.store';
import type { VersionMetadata } from '$lib/types/version';
import { derived, type Readable } from 'svelte/store';

export const missionControlVersion: Readable<VersionMetadata | undefined> = derived(
	[versionStore],
	([$versionStore]) => $versionStore?.missionControl
);
