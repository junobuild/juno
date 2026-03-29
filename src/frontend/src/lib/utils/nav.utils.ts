import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { nonNullish } from '@dfinity/utils';
import type { Nullish } from '@dfinity/zod-schemas';
import type { Principal } from '@icp-sdk/core/principal';
import type { LoadEvent } from '@sveltejs/kit';

export const overviewLink = (satelliteId: Nullish<Principal>): string =>
	`/satellite/?s=${satelliteId?.toText() ?? ''}`;

export const deploymentsLink = (satelliteId: Nullish<Principal>): string =>
	`/deployments/?s=${satelliteId?.toText() ?? ''}`;

export const monitoringLink = (satelliteId?: Nullish<Principal>): string =>
	`/monitoring/${nonNullish(satelliteId) ? `?s=${satelliteId?.toText() ?? ''}` : ''}`;

export const analyticsLink = (satelliteId?: Nullish<Principal>): string =>
	`/analytics/${nonNullish(satelliteId) ? `?s=${satelliteId?.toText() ?? ''}` : ''}`;

export const upgradeDockLink = (satelliteId?: Nullish<Principal>): string =>
	`/upgrade-dock/${nonNullish(satelliteId) ? `?s=${satelliteId?.toText() ?? ''}` : ''}`;

export const upgradeChangesLink = (satelliteId: Nullish<Principal>): string =>
	`/upgrade-dock/?tab=changes${nonNullish(satelliteId) ? `&s=${satelliteId?.toText() ?? ''}` : ''}`;

export const navigateToSatellite = async (satelliteId: Nullish<Principal>) =>
	await goto(overviewLink(satelliteId));

export const navigateToAnalytics = async (satelliteId: Nullish<Principal>) =>
	await goto(analyticsLink(satelliteId), { replaceState: true });

export const navigateToMonitoring = async (satelliteId: Nullish<Principal>) =>
	await goto(monitoringLink(satelliteId), { replaceState: true });

export const navigateToChangesDock = async (satelliteId: Nullish<Principal>) =>
	await goto(upgradeChangesLink(satelliteId), { replaceState: true });

export const back = async ({ pop }: { pop: boolean }) => {
	if (pop) {
		history.back();
		return;
	}

	await goto('/');
};

export interface RouteSatellite {
	satellite: Nullish<string>;
}
export interface RouteTab {
	tab: Nullish<string>;
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
