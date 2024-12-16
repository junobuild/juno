import type { SatellitesLayout } from '$lib/types/layout';
import {
	getLocalStorageSatellitesLayout,
	setLocalStorageItem
} from '$lib/utils/local-storage.utils';
import { writable } from 'svelte/store';

const initialSatellitesLayout = getLocalStorageSatellitesLayout();

export const initSatellitesLayout = () => {
	const { subscribe, set } = writable<SatellitesLayout>(initialSatellitesLayout);

	return {
		subscribe,

		select: (layout: SatellitesLayout) => {
			setLocalStorageItem({ key: 'satellites_layout', value: layout });
			set(layout);
		}
	};
};

export const layoutSatellites = initSatellitesLayout();
