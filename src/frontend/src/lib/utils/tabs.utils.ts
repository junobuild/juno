import { page } from '$app/state';
import type { Tab } from '$lib/types/tabs.context';
import { groupLabel } from '$lib/utils/i18n.utils';

export const initTabId = (tabs: Tab[]): symbol =>
	tabs.find(({ labelKey }) => groupLabel(labelKey)?.toLowerCase() === page.data?.tab?.toLowerCase())
		?.id ?? tabs[0].id;
