<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Cdn from '$lib/components/cdn/list/Cdn.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import Logs from '$lib/components/logs/Logs.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
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
	<Tabs>
		<Loaders>
			<SatelliteGuard>
				{#if nonNullish($satelliteStore) && nonNullish($missionControlIdDerived)}
					{#if $store.tabId === $store.tabs[0].id}
						<Logs satelliteId={$satelliteStore.satellite_id} />
					{:else if $store.tabId === $store.tabs[1].id}
						<Cdn satellite={$satelliteStore} />
					{/if}
				{/if}
			</SatelliteGuard>
		</Loaders>
	</Tabs>
</IdentityGuard>
