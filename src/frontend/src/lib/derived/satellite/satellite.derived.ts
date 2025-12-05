import type { MissionControlDid } from '$declarations';
import { pageSatelliteId } from '$lib/derived/app/page.derived.svelte.js';
import { satellitesStore } from '$lib/derived/satellite/satellites.derived';
import type { SatelliteUi } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { satelliteMetadata } from '$lib/utils/satellite.utils';
import { isNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const satelliteStore: Readable<Option<MissionControlDid.Satellite>> = derived(
	[satellitesStore, pageSatelliteId],
	([$satellites, $pageSatelliteId]) => {
		if (isNullish($pageSatelliteId)) {
			return null;
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

export const satelliteUi: Readable<Option<SatelliteUi>> = derived(
	[satelliteStore],
	([$satelliteStore]) => {
		if (isNullish($satelliteStore)) {
			return $satelliteStore;
		}

		return {
			...$satelliteStore,
			metadata: satelliteMetadata($satelliteStore)
		};
	}
);
