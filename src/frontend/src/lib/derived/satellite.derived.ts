import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { pageSatelliteId } from '$lib/derived/page.derived.svelte';
import { satellitesStore } from '$lib/derived/satellites.derived';
import type { Option } from '$lib/types/utils';
import { isNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const satelliteStore: Readable<Option<Satellite>> = derived(
	[satellitesStore, pageSatelliteId],
	([$satellites, $pageSatelliteId]) => {
		if (isNullish($pageSatelliteId)) {
			return undefined;
		}

		// Satellites not loaded yet
		if ($satellites === undefined) {
			return undefined;
		}

		const satellite = ($satellites ?? []).find(
			({ satellite_id }) => satellite_id.toText() === $pageSatelliteId
		);

		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		return satellite === undefined ? null : satellite;
	}
);
