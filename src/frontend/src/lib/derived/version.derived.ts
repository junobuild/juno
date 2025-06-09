import { versionStore } from '$lib/stores/version.store';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { SatelliteVersionMetadataUi, VersionMetadataUi } from '$lib/types/version';
import { isNullish, nonNullish } from '@dfinity/utils';
import { compare } from 'semver';
import { derived, type Readable } from 'svelte/store';

export const missionControlVersion: Readable<VersionMetadataUi | undefined> = derived(
	[versionStore],
	([$versionStore]) => {
		if (isNullish($versionStore?.missionControl)) {
			return undefined;
		}

		let current = $versionStore.missionControl.current;
		let release = $versionStore.missionControl.release;

		return {
			...$versionStore.missionControl,
			warning: compare(current, release) < 0
		};
	}
);

export const orbiterVersion: Readable<VersionMetadataUi | undefined> = derived(
	[versionStore],
	([$versionStore]) => {
		if (isNullish($versionStore?.orbiter)) {
			return undefined;
		}

		let current = $versionStore.orbiter.current;
		let release = $versionStore.orbiter.release;

		return {
			...$versionStore.orbiter,
			warning: compare(current, release) < 0
		};
	}
);

export const satellitesVersion = derived([versionStore], ([$versionStore]) =>
	Object.entries($versionStore.satellites).reduce<
		Record<SatelliteIdText, SatelliteVersionMetadataUi | undefined>
	>(
		(acc, [key, value]) => ({
			...acc,
			[key]: nonNullish(value)
				? {
						...value,
						warning: compare(value.current, value.release) < 0
					}
				: value
		}),
		{}
	)
);
