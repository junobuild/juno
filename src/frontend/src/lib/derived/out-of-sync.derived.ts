import {
	consoleOrbiters,
	consoleSatellites,
	consoleUfos
} from '$lib/derived/console/segments.derived';
import { mctrlOrbiters } from '$lib/derived/mission-control/mission-control-orbiters.derived';
import { mctrlSatellites } from '$lib/derived/mission-control/mission-control-satellites.derived';
import { mctrlUfos } from '$lib/derived/mission-control/mission-control-ufos.derived';
import { derived } from 'svelte/store';

export const outOfSyncSatellites = derived(
	[consoleSatellites, mctrlSatellites],
	([$consoleSatellites, $mctrlSatellites]): boolean | undefined => {
		// Not yet fully loaded
		if ($consoleSatellites === undefined || $mctrlSatellites === undefined) {
			return undefined;
		}

		// No mission control
		if ($mctrlSatellites === null) {
			return false;
		}

		if ($consoleSatellites?.length === 0 && $mctrlSatellites.length === 0) {
			return false;
		}

		const inSync =
			$consoleSatellites?.length === $mctrlSatellites.length &&
			($consoleSatellites ?? []).every(
				({ satellite_id: segment_id }) =>
					$mctrlSatellites.find(
						({ satellite_id }) => satellite_id.toText() === segment_id.toText()
					) !== undefined
			);

		return !inSync;
	}
);

export const outOfSyncOrbiters = derived(
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

		const inSync =
			$consoleOrbiters?.length === $mctrlOrbiters.length &&
			($consoleOrbiters ?? []).every(
				({ orbiter_id: segment_id }) =>
					$mctrlOrbiters.find(({ orbiter_id }) => orbiter_id.toText() === segment_id.toText()) !==
					undefined
			);

		return !inSync;
	}
);

export const outOfSyncUfos = derived(
	[consoleUfos, mctrlUfos],
	([$consoleUfos, $mctrlUfos]): boolean | undefined => {
		// Not yet fully loaded
		if ($consoleUfos === undefined || $mctrlUfos === undefined) {
			return undefined;
		}

		// No mission control
		if ($mctrlUfos === null) {
			return false;
		}

		if ($consoleUfos?.length === 0 && $mctrlUfos.length === 0) {
			return false;
		}

		const inSync =
			$consoleUfos?.length === $mctrlUfos.length &&
			($consoleUfos ?? []).every(
				({ ufo_id: segment_id }) =>
					$mctrlUfos.find(({ ufo_id }) => ufo_id.toText() === segment_id.toText()) !== undefined
			);

		return !inSync;
	}
);
