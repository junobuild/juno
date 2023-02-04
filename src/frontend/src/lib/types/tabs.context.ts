import type { Writable } from 'svelte/store';

export interface Tab {
	id: symbol;
	name: string;
}

export interface TabsStore {
	tabId: symbol;
	tabs: Tab[];
}

export interface TabsContext {
	store: Writable<TabsStore>;
}

export const TABS_CONTEXT_KEY = Symbol('tabs');
