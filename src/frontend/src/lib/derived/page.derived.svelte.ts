import { page } from '$app/state';
import type { SatelliteIdText } from '$lib/types/satellite';
import { type Readable, writable } from 'svelte/store';

type PageSatelliteIdStoreData = SatelliteIdText | undefined;

export type PageSatelliteIdStore = Readable<PageSatelliteIdStoreData>;

const initPageSatelliteIdStore = (): PageSatelliteIdStore => {
	const cleanup = $effect.root(() => {
		$effect(() => {
			set(page.data?.satellite);
		});
	});

	const { subscribe, set } = writable<PageSatelliteIdStoreData>(undefined, cleanup);

	return {
		subscribe
	};
};

export const pageSatelliteId = initPageSatelliteIdStore();
