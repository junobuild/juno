<script lang="ts">
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsData
	} from '$lib/types/tabs.context';
	import { writable } from 'svelte/store';
	import { initTabId } from '$lib/utils/tabs.utils';
	import { setContext } from 'svelte';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'upgrade_dock.title'
		}
	];

	const store = writable<TabsData>({
		tabId: initTabId(tabs),
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});
</script>

TODO
