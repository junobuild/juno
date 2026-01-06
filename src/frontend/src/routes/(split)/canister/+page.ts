import { loadRouteCanister, type RouteCanister } from '$lib/utils/nav.utils';
import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ($event: LoadEvent): RouteCanister => loadRouteCanister($event);
