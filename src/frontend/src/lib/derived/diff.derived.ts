import { consoleOrbiters, consoleSatellites } from '$lib/derived/console/segments.derived';
import { mctrlOrbiters } from '$lib/derived/mission-control/mission-control-orbiters.derived';
import { mctrlSatellitesStore } from '$lib/derived/mission-control/mission-control-satellites.derived';
import { derived } from 'svelte/store';

export const divergentSatellites = derived(
	[consoleSatellites, mctrlSatellitesStore],
	([$consoleSatellites, $mctrlSatellitesStore]): boolean | undefined => {
		// Not yet fully loaded
		if ($consoleSatellites === undefined || $mctrlSatellitesStore === undefined) {
			return undefined;
		}

		// No mission control
		if ($mctrlSatellitesStore === null) {
			return false;
		}

		if ($consoleSatellites?.length === 0 && $mctrlSatellitesStore.length === 0) {
			return false;
		}

		return (
			$consoleSatellites?.length === $mctrlSatellitesStore.length &&
			($consoleSatellites ?? []).every(
				({ satellite_id: segment_id }) =>
					$mctrlSatellitesStore.find(
						({ satellite_id }) => satellite_id.toText() === segment_id.toText()
					) !== undefined
			)
		);
	}
);

export const divergentOrbiters = derived(
	[consoleOrbiters, mctrlOrbiters],
	([$consoleOrbiters, $mctrlOrbiters]): boolean | undefined => {
		// Not yet fully loaded
		if ($consoleOrbiters === undefined || $mctrlOrbiters === undefined) {
			return undefined;
		}

		// No mission control
		if ($mctrlOrbiters === null) {
			return false;
		}

		if ($consoleOrbiters?.length === 0 && $mctrlOrbiters.length === 0) {
			return false;
		}

		return (
			$consoleOrbiters?.length === $mctrlOrbiters.length &&
			($consoleOrbiters ?? []).every(
				({ orbiter_id: segment_id }) =>
					$mctrlOrbiters.find(({ orbiter_id }) => orbiter_id.toText() === segment_id.toText()) !==
					undefined
			)
		);
	}
);
