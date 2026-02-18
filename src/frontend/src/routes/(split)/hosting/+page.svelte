<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Loaders from '$lib/components/app/loaders/Loaders.svelte';
	import IdentityGuard from '$lib/components/auth/guards/IdentityGuard.svelte';
	import SatelliteGuard from '$lib/components/satellites/guards/SatelliteGuard.svelte';
	import Hosting from '$lib/components/satellites/hosting/Hosting.svelte';
	import HostingSettings from '$lib/components/satellites/hosting/HostingSettings.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
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
			labelKey: 'hosting.domains'
		},
		{
			id: Symbol('2'),
			labelKey: 'core.settings'
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
						<Hosting {satellite} />
					{:else if $store.tabId === $store.tabs[1].id}
						<HostingSettings {satellite} />
					{/if}
				</Tabs>
			{/snippet}
		</SatelliteGuard>
	</Loaders>
</IdentityGuard>
