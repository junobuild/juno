import { tabStore } from '$lib/derived/tabs.derived';
import type { Tab } from '$lib/types/tabs.context';
import { groupLabel } from '$lib/utils/i18n.utils';
import { get } from 'svelte/store';

export const initTabId = (tabs: Tab[]): symbol =>
	tabs.find(({ labelKey }) => groupLabel(labelKey)?.toLowerCase() === get(tabStore)?.toLowerCase())
		?.id ?? tabs[0].id;
