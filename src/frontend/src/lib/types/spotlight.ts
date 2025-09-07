import type { Component } from 'svelte';

export interface SpotlightItem {
	text: string;
	icon: Component;
}

export interface SpotlightNavItem extends SpotlightItem {
	type: 'nav';
	href: string;
}

export interface SpotlightActionItem extends SpotlightItem {
	type: 'action';
}

export type SpotlightItems = (SpotlightNavItem | SpotlightActionItem)[];
