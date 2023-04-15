import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { Principal } from '@dfinity/principal';
import type { LoadEvent } from '@sveltejs/kit';

export const overviewLink = (satelliteId: Principal | undefined | null): string =>
	`/satellite/?s=${satelliteId?.toText() ?? ''}`;

export const navigateToSatellite = async (satelliteId: Principal | undefined | null) =>
	await goto(overviewLink(satelliteId));

export const back = async () => {
	const stack: number | undefined = history.state?.['sveltekit:index'];

	if (!stack || stack === 0) {
		await goBack();
		return;
	}

	history.back();
};

const goBack = async (defaultRoute = '/') => {
	const { referrer } = document;
	return goto(referrer.length > 0 ? referrer : defaultRoute);
};

export type RouteSatellite = { satellite: string | null | undefined };

export const loadRouteSatellite = ($event: LoadEvent): RouteSatellite => {
	if (!browser) {
		return {
			satellite: undefined
		};
	}

	const {
		url: { searchParams }
	} = $event;

	return {
		satellite: searchParams?.get('s')
	};
};
