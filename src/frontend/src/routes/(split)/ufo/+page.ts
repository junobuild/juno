import { loadRouteUfo, type RouteUfo } from '$lib/utils/nav.utils';
import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ($event: LoadEvent): RouteUfo => loadRouteUfo($event);
