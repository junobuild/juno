import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { Option } from '$lib/types/utils';
import { nonNullish } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import type { LoadEvent } from '@sveltejs/kit';

// TODO: rename to reflect Satellite or use same page for canister?
export const overviewLink = (satelliteId: Option<Principal>): string =>
	`/satellite/?s=${satelliteId?.toText() ?? ''}`;

export const monitoringLink = (satelliteId?: Option<Principal>): string =>
	`/monitoring/${nonNullish(satelliteId) ? `?s=${satelliteId?.toText() ?? ''}` : ''}`;

export const analyticsLink = (satelliteId?: Option<Principal>): string =>
	`/analytics/${nonNullish(satelliteId) ? `?s=${satelliteId?.toText() ?? ''}` : ''}`;

export const upgradeDockLink = (satelliteId?: Option<Principal>): string =>
	`/upgrade-dock/${nonNullish(satelliteId) ? `?s=${satelliteId?.toText() ?? ''}` : ''}`;

export const upgradeChangesLink = (satelliteId: Option<Principal>): string =>
	`/upgrade-dock/?tab=changes${nonNullish(satelliteId) ? `&s=${satelliteId?.toText() ?? ''}` : ''}`;

export const canisterLink = (canisterId?: Option<Principal>): string =>
	`/canister/${nonNullish(canisterId) ? `?c=${canisterId?.toText() ?? ''}` : ''}`;

export const navigateToSatellite = async (satelliteId: Option<Principal>) =>
	await goto(overviewLink(satelliteId));

export const navigateToAnalytics = async (satelliteId: Option<Principal>) =>
	await goto(analyticsLink(satelliteId), { replaceState: true });

export const navigateToMonitoring = async (satelliteId: Option<Principal>) =>
	await goto(monitoringLink(satelliteId), { replaceState: true });

export const navigateToChangesDock = async (satelliteId: Option<Principal>) =>
	await goto(upgradeChangesLink(satelliteId), { replaceState: true });

export const navigateToCanister = async (canisterId: Option<Principal>) =>
	await goto(canisterLink(canisterId));

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

export interface RouteCanister {
	canister: Option<string>;
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

export const loadRouteCanister = ($event: LoadEvent): RouteCanister => {
	if (!browser) {
		return {
			canister: undefined
		};
	}

	const {
		url: { searchParams }
	} = $event;

	return {
		canister: searchParams?.get('c'),
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
