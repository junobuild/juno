import { page } from '$app/stores';
import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { satellitesUncertifiedStore } from '$lib/stores/satellite.store';
import { isNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

// TODO: rename without suffix store but find another naming that satellite and satelliteId because we probably already use those for local variable.

export const satellitesStore = derived(
	[satellitesUncertifiedStore],
	([$satellitesDataStore]) => $satellitesDataStore?.data
);

export const satelliteStore: Readable<Satellite | undefined | null> = derived(
	[satellitesStore, page],
	([satellites, page]) => {
		const { data } = page;

		if (isNullish(data.satellite)) {
			return undefined;
		}

		// Satellites not loaded yet
		if (satellites === undefined) {
			return undefined;
		}

		const satellite = (satellites ?? []).find(
			({ satellite_id }) => satellite_id.toText() === data.satellite
		);

		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		return satellite === undefined ? null : satellite;
	}
);

export const satellitesLoaded = derived(
	[satellitesUncertifiedStore],
	([$satellitesDataStore]) => $satellitesDataStore !== undefined
);

export const satellitesNotLoaded = derived(
	[satellitesLoaded],
	([$satellitesLoaded]) => !$satellitesLoaded
);
