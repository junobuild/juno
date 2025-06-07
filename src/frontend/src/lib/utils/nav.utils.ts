import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { Option } from '$lib/types/utils';
import type { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';
import type { LoadEvent } from '@sveltejs/kit';

export const overviewLink = (satelliteId: Option<Principal>): string =>
	`/satellite/?s=${satelliteId?.toText() ?? ''}`;

export const analyticsLink = (satelliteId: Option<Principal>): string =>
	`/analytics/${nonNullish(satelliteId) ? `?s=${satelliteId?.toText() ?? ''}` : ''}`;

export const upgradeDockLink = (satelliteId: Option<Principal>): string =>
	`/upgrade-dock/${nonNullish(satelliteId) ? `?s=${satelliteId?.toText() ?? ''}` : ''}`;

export const navigateToSatellite = async (satelliteId: Option<Principal>) =>
	await goto(overviewLink(satelliteId));

export const navigateToAnalytics = async (satelliteId: Option<Principal>) =>
	await goto(analyticsLink(satelliteId), { replaceState: true });

export const navigateToUpgradeDock = async (satelliteId: Option<Principal>) =>
	await goto(upgradeDockLink(satelliteId), { replaceState: true });

export const back = async ({ pop }: { pop: boolean }) => {
	if (pop) {
		history.back();
		return;
	}

	await goto('/');
};

export interface RouteSatellite {
	satellite: Option<string>;
}
export interface RouteTab {
	tab: Option<string>;
}

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
		satellite: searchParams?.get('s'),
		...loadRouteTab($event)
	};
};

export const loadRouteTab = ($event: LoadEvent): RouteTab => {
	if (!browser) {
		return {
			tab: undefined
		};
	}

	const {
		url: { searchParams }
	} = $event;

	return {
		tab: searchParams?.get('tab')
	};
};

export const isRouteSelected = ({
	routeId,
	path
}: {
	routeId: string | null;
	path: string;
}): boolean => routeId?.includes(path) ?? false;
