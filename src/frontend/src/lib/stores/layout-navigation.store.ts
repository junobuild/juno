import { initDataStore } from '$lib/stores/_data.store';
import type { MissionControlDid } from '$lib/types/declarations';
import type { Component } from 'svelte';

export const layoutNavigation = initDataStore<{
	title: string;
	satellite?: { satellite: MissionControlDid.Satellite; useInPageTitle: boolean };
	icon: Component;
}>();
