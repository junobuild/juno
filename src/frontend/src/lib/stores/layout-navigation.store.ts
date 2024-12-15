import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { initDataStore } from '$lib/stores/data.store';
import type { Component } from 'svelte';

export const layoutNavigation = initDataStore<{
	title: string;
	satellite?: { satellite: Satellite; useInPageTitle: boolean };
	icon: Component;
}>();
