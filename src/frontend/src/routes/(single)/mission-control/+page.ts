import { loadRouteTab, type RouteTab } from '$lib/utils/nav.utils';
import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from '../../../../../../.svelte-kit/types/src/frontend';

export const load: PageLoad = ($event: LoadEvent): RouteTab => loadRouteTab($event);
