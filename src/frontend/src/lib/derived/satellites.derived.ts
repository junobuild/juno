import { consoleSatellites } from '$lib/derived/console/segments.derived';
import { mctrlSatellitesStore } from '$lib/derived/mission-control/mission-control-satellites.derived';
import type { Satellite, SatelliteUi } from '$lib/types/satellite';
import { satelliteMetadata, satelliteName } from '$lib/utils/satellite.utils';
import { derived } from 'svelte/store';

export const satellitesStore = derived(
	[consoleSatellites, mctrlSatellitesStore],
	([$consoleSatellites, $mctrlSatellitesStore]): Satellite[] | undefined => {
		// Not yet fully loaded
		if ($consoleSatellites === undefined || $mctrlSatellitesStore === undefined) {
			return undefined;
		}

		return [
			...$consoleSatellites.filter(
				({ satellite_id }) =>
					($mctrlSatellitesStore ?? []).find(
						({ satellite_id: id }) => id.toText() === satellite_id.toText()
					) === undefined
			),
			...($mctrlSatellitesStore ?? [])
		];
	}
);

export const satellitesLoaded = derived(
	[satellitesStore],
	([$satellitesStore]) => $satellitesStore !== undefined
);

export const satellitesNotLoaded = derived(
	[satellitesLoaded],
	([$satellitesLoaded]) => !$satellitesLoaded
);

export const sortedSatellites = derived([satellitesStore], ([$satellitesStore]) =>
	($satellitesStore ?? []).sort((a, b) => satelliteName(a).localeCompare(satelliteName(b)))
);

export const sortedSatelliteUis = derived([sortedSatellites], ([$sortedSatellites]) =>
	$sortedSatellites.map<SatelliteUi>((satellite) => ({
		...satellite,
		metadata: satelliteMetadata(satellite)
	}))
);
