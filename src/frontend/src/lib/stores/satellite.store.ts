import { page } from '$app/stores';
import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { Option } from '$lib/types/utils';
import { isNullish } from '@dfinity/utils';
import { derived, writable, type Readable } from 'svelte/store';

type SatellitesStoreData = Option<Satellite[]>;

interface SatellitesStore extends Readable<SatellitesStoreData> {
	set: (satellites: Satellite[]) => void;
	reset: () => void;
}

const initSatellitesStore = (): SatellitesStore => {
	const { subscribe, set } = writable<SatellitesStoreData>(undefined);

	return {
		subscribe,

		set(satellites) {
			set(satellites);
		},

		reset: () => {
			set(null);
		}
	};
};

export const satellitesStore = initSatellitesStore();

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
