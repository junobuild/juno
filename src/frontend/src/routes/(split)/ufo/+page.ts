import { loadRouteContext, type RouteContext } from '$lib/utils/nav.utils';
import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ($event: LoadEvent): RouteContext => loadRouteContext($event);
