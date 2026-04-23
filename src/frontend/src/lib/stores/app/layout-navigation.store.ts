import { initDataStore } from '$lib/stores/_data.store';
import type { Satellite } from '$lib/types/satellite';
import type { Ufo } from '$lib/types/ufo';
import type { Component } from 'svelte';

export const layoutNavigation = initDataStore<{
	title: string;
	satellite?: { satellite: Satellite; useInPageTitle: boolean };
	ufo?: { ufo: Ufo; useInPageTitle: boolean };
	icon: Component;
}>();
