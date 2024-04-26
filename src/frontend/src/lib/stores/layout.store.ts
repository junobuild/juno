import type { IntersectingDetail } from '$lib/directives/intersection.directives';
import type { ComponentType } from 'svelte';
import { writable } from 'svelte/store';

export const layoutMenuOpen = writable<boolean>(false);
export const layoutTitleIntersecting = writable<boolean>(true);
export const layoutTitle = writable<{ title: string; icon: ComponentType } | undefined>();

export const onLayoutTitleIntersection = ($event: Event) => {
	const {
		detail: { intersecting }
	} = $event as unknown as CustomEvent<IntersectingDetail>;

	layoutTitleIntersecting.set(intersecting);
};
