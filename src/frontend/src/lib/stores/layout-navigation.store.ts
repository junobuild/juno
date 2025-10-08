import type { MissionControlDid } from '$declarations';
import { initDataStore } from '$lib/stores/_data.store';
import type { Component } from 'svelte';

export const layoutNavigation = initDataStore<{
	title: string;
	satellite?: { satellite: MissionControlDid.Satellite; useInPageTitle: boolean };
	icon: Component;
}>();
