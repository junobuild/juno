import type { Component } from 'svelte';

export interface SpotlightItemFilterParams  {signedIn: boolean, query: string}

export interface SpotlightItem {
	text: string;
	icon: Component;
	filter: (params: SpotlightItemFilterParams) => boolean;
}

export interface SpotlightNavItem extends SpotlightItem {
	type: 'nav';
	href: string;
	external?: boolean;
}

export interface SpotlightActionItem extends SpotlightItem {
	type: 'action';
}

export type SpotlightItems = (SpotlightNavItem | SpotlightActionItem)[];
