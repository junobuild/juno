import { satellitesStore } from '$lib/derived/satellites.derived';
import { versionStore } from '$lib/stores/version.store';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import type { SatelliteVersionMetadataUi, VersionMetadataUi } from '$lib/types/version';
import { isNullish, nonNullish } from '@dfinity/utils';
import { compare } from 'semver';
import { derived, type Readable } from 'svelte/store';

export const missionControlVersion: Readable<Option<VersionMetadataUi>> = derived(
	[versionStore],
	([$versionStore]) => {
		if (isNullish($versionStore.missionControl)) {
			return $versionStore.missionControl;
		}

		const { current } = $versionStore.missionControl;
		const { release } = $versionStore.missionControl;

		return {
			...$versionStore.missionControl,
			warning: compare(current, release) < 0
		};
	}
);

export const orbiterVersion: Readable<Option<VersionMetadataUi>> = derived(
	[versionStore],
	([$versionStore]) => {
		if (isNullish($versionStore.orbiter)) {
			return $versionStore.orbiter;
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
		Record<SatelliteIdText, Option<SatelliteVersionMetadataUi>>
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

export const missionControlVersionLoaded = derived(
	[missionControlVersion],
	([$missionControlVersion]) => $missionControlVersion !== undefined
);

export const missionControlVersionNotLoaded = derived(
	[missionControlVersionLoaded],
	([$missionControlVersionLoaded]) => !$missionControlVersionLoaded
);

export const orbiterVersionLoaded = derived(
	[orbiterVersion],
	([$orbiterVersion]) => $orbiterVersion !== undefined
);

export const orbiterVersionNotLoaded = derived(
	[orbiterVersionLoaded],
	([$orbiterVersionLoaded]) => !$orbiterVersionLoaded
);

export const satellitesVersionLoaded = derived(
	[satellitesStore, satellitesVersion],
	([$satellitesStore, $satellitesVersion]) =>
		nonNullish($satellitesStore) &&
		$satellitesStore.every(
			(satellite) => $satellitesVersion?.[satellite.satellite_id.toText()] !== undefined
		)
);

export const satellitesVersionNotLoaded = derived(
	[satellitesVersionLoaded],
	([$satellitesVersionLoaded]) => !$satellitesVersionLoaded
);

export const versionsNotLoaded = derived(
	[missionControlVersionNotLoaded, orbiterVersionNotLoaded, satellitesVersionNotLoaded],
	([$missionControlVersionNotLoaded, $orbiterVersionNotLoaded, $satellitesVersionNotLoaded]) =>
		$missionControlVersionNotLoaded || $orbiterVersionNotLoaded || $satellitesVersionNotLoaded
);

export const versionsLoaded = derived(
	[versionsNotLoaded],
	([$versionsNotLoaded]) => !$versionsNotLoaded
);

export const versionsUpgradeWarning = derived(
	[missionControlVersion, orbiterVersion, satellitesVersion],
	([$missionControlVersion, $orbiterVersion, $satellitesVersion]) =>
		$missionControlVersion?.warning === true ||
		$orbiterVersion?.warning === true ||
		Object.values($satellitesVersion).find((version) => version?.warning === true) !== undefined
);
