<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import ChangesDock from '$lib/components/changes/list/ChangesDock.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import UpgradeDock from '$lib/components/upgrade/list/UpgradeDock.svelte';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsData
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'upgrade.releases'
		},
		{
			id: Symbol('2'),
			labelKey: 'upgrade.changes'
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

<IdentityGuard>
	<Tabs>
		<Loaders>
			<MissionControlGuard>
				{#if $store.tabId === $store.tabs[0].id}
					<UpgradeDock />
				{:else if $store.tabId === $store.tabs[1].id}
					<ChangesDock />
				{/if}
			</MissionControlGuard>
		</Loaders>
	</Tabs>
</IdentityGuard>
