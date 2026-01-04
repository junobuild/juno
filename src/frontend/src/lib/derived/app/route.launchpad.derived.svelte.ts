import { page } from '$app/state';
import { type Readable, writable } from 'svelte/store';

const routeId = $derived<string | null>(page.route.id);

type IsLaunchpadRouteStoreData = boolean | undefined;

export type IsLaunchpadRouteStoreDataStore = Readable<IsLaunchpadRouteStoreData>;

const initIsLaunchpadRouteStore = (): IsLaunchpadRouteStoreDataStore => {
	const { subscribe, set } = writable<IsLaunchpadRouteStoreData>(undefined);

	$effect.root(() => {
		$effect(() => {
			set(routeId === '/(home)');
		});
	});

	return {
		subscribe
	};
};

export const isLaunchpadRoute = initIsLaunchpadRouteStore();
