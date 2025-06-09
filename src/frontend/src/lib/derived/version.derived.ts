import { satellitesStore } from '$lib/derived/satellites.derived';
import { versionStore } from '$lib/stores/version.store';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { SatelliteVersionMetadataUi, VersionMetadataUi } from '$lib/types/version';
import { isNullish, nonNullish } from '@dfinity/utils';
import { compare } from 'semver';
import { derived, type Readable } from 'svelte/store';
import { orbiterLoaded } from '$lib/derived/orbiter.derived';

export const missionControlVersion: Readable<VersionMetadataUi | undefined> = derived(
	[versionStore],
	([$versionStore]) => {
		if (isNullish($versionStore?.missionControl)) {
			return undefined;
		}

		const { current } = $versionStore.missionControl;
		const { release } = $versionStore.missionControl;

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

		const { current } = $versionStore.orbiter;
		const { release } = $versionStore.orbiter;

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
				: undefined
		}),
		{}
	)
);

export const satellitesVersionLoaded = derived(
	[satellitesStore, satellitesVersion],
	([$satellitesStore, $satellitesVersion]) =>
		nonNullish($satellitesStore) &&
		$satellitesStore.every((satellite) =>
			$satellitesVersion?.[satellite.satellite_id.toText()] !== undefined
		)
);

export const satellitesVersionNotLoaded = derived([satellitesVersionLoaded], ([$satellitesVersionLoaded]) => !$satellitesVersionLoaded);