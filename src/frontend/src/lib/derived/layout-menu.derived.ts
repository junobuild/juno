import { layoutMenuState } from '$lib/stores/layout-menu.store';
import { derived } from 'svelte/store';

export const menuCollapsed = derived(
	[layoutMenuState],
	([layoutMenuCollapsed]) => layoutMenuCollapsed === 'collapsed'
);

export const menuExpanded = derived(
	[layoutMenuState],
	([layoutMenuCollapsed]) => layoutMenuCollapsed === 'expanded'
);
