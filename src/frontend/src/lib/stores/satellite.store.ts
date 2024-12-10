import { page } from '$app/stores';
import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { initDataStore } from '$lib/stores/data.store';
import type { Option } from '$lib/types/utils';
import { isNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

type SatellitesStoreData = Option<Satellite[]>;
export const satellitesStore = initDataStore<SatellitesStoreData>();

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

export const satelliteIdStore: Readable<string | undefined> = derived([page], ([page]) => {
	const { data } = page;

	if (isNullish(data.satellite)) {
		return undefined;
	}

	return data.satellite;
});
