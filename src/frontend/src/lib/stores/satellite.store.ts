import { page } from '$app/stores';
import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { isNullish } from '$lib/utils/utils';
import { derived, writable, type Readable } from 'svelte/store';

export const satellitesStore = writable<Satellite[] | undefined | null>(undefined);

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
