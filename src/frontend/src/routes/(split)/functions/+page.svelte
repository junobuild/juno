<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Loaders from '$lib/components/app/loaders/Loaders.svelte';
	import IdentityGuard from '$lib/components/auth/guards/IdentityGuard.svelte';
	import Cdn from '$lib/components/satellites/cdn/list/Cdn.svelte';
	import SatelliteGuard from '$lib/components/satellites/guards/SatelliteGuard.svelte';
	import Logs from '$lib/components/satellites/logs/Logs.svelte';
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
			labelKey: 'functions.logs'
		},
		{
			id: Symbol('2'),
			labelKey: 'cdn.title'
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
						<Logs satelliteId={satellite.satellite_id} />
					{:else if $store.tabId === $store.tabs[1].id}
						<Cdn {satellite} />
					{/if}
				</Tabs>
			{/snippet}
		</SatelliteGuard>
	</Loaders>
</IdentityGuard>
