import { page } from '$app/state';
import { isRouteSelected } from '$lib/utils/nav.utils';
import { type Readable, writable } from 'svelte/store';

const satellitePaths = [
	'satellite',
	'authentication',
	'datastore',
	'storage',
	'functions',
	'hosting'
];

const routeId: string | null = $derived(page.route.id);

type PageSatelliteIdStoreData = boolean | undefined;

export type PageSatelliteIdStore = Readable<PageSatelliteIdStoreData>;

const initIsSatelliteRouteStore = (): PageSatelliteIdStore => {
	const { subscribe, set } = writable<PageSatelliteIdStoreData>(undefined);

	$effect.root(() => {
		$effect(() => {
			const isSatelliteRoute =
				satellitePaths.find((path) => isRouteSelected({ routeId, path })) !== undefined;
			set(isSatelliteRoute);
		});
	});

	return {
		subscribe
	};
};

export const isSatelliteRoute = initIsSatelliteRouteStore();
