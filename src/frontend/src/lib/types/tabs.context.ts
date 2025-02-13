import type { Writable } from 'svelte/store';

export interface Tab {
	id: symbol;
	labelKey: string;
}

export interface TabsData {
	tabId: symbol;
	tabs: Tab[];
}

export interface TabsContext {
	store: Writable<TabsData>;
}

export const TABS_CONTEXT_KEY = Symbol('tabs');
