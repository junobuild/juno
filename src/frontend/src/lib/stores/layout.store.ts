import type { IntersectingDetail } from '$lib/directives/intersection.directives';
import type { SatellitesLayout } from '$lib/types/layout';
import {
	getLocalStorageSatellitesLayout,
	setLocalStorageItem
} from '$lib/utils/local-storage.utils';
import type { Component } from 'svelte';
import { writable } from 'svelte/store';

export const layoutMenuOpen = writable<boolean>(false);
export const layoutTitleIntersecting = writable<boolean>(true);
export const layoutTitle = writable<{ title: string; icon: Component } | undefined>();

export const onLayoutTitleIntersection = ($event: Event) => {
	const {
		detail: { intersecting }
	} = $event as unknown as CustomEvent<IntersectingDetail>;

	layoutTitleIntersecting.set(intersecting);
};

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
