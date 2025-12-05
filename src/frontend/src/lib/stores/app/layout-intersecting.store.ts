import type { IntersectingDetail } from '$lib/directives/intersection.directives';
import { writable } from 'svelte/store';

export const layoutTitleIntersecting = writable<boolean>(true);

export const onLayoutTitleIntersection = ($event: Event) => {
	const {
		detail: { intersecting }
	} = $event as unknown as CustomEvent<IntersectingDetail>;

	layoutTitleIntersecting.set(intersecting);
};
