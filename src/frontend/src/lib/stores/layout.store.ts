import type { Component } from 'svelte';
import { writable } from 'svelte/store';

export const layoutTitle = writable<{ title: string; icon: Component } | undefined>();
export const layoutSatellitesSwitcher = writable<boolean>(false);
