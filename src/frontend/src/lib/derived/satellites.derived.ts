import { accountSatellites } from '$lib/derived/console/account.derived';
import { satellitesStore as mctrlSatellitesStore } from '$lib/derived/mission-control/satellites.derived';
import type { SatelliteUi } from '$lib/types/satellite';
import { satelliteMetadata, satelliteName } from '$lib/utils/satellite.utils';
import { isNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const satellitesStore = derived(
	[accountSatellites, mctrlSatellitesStore],
	([$accountSatellites, $mctrlSatellitesStore]) => {
		if (isNullish($accountSatellites) || isNullish($mctrlSatellitesStore)) {
			return undefined;
		}

		return [
			...$accountSatellites.filter(
				({ satellite_id }) =>
					$mctrlSatellitesStore.find(
						({ satellite_id: id }) => id.toText() === satellite_id.toText()
					) === undefined
			),
			...$mctrlSatellitesStore
		];
	}
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
