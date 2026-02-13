<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Automation from '$lib/components/automation/Automation.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import {
		type Tab,
		type TabsContext,
		type TabsData,
		TABS_CONTEXT_KEY
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'automation.title'
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
	<Loaders>
		<SatelliteGuard>
			{#snippet content(satellite)}
				<Tabs>
					{#if $store.tabId === $store.tabs[0].id}
						<Automation {satellite} />
					{/if}
				</Tabs>
			{/snippet}
		</SatelliteGuard>
	</Loaders>
</IdentityGuard>
