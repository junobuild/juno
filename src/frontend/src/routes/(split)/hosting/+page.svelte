<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import Hosting from '$lib/components/hosting/Hosting.svelte';
	import HostingSettings from '$lib/components/hosting/HostingSettings.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
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
			<Tabs>
				<MissionControlGuard>
					{#if nonNullish($satelliteStore) && nonNullish($missionControlIdDerived)}
						{#if $store.tabId === $store.tabs[0].id}
							<Hosting satellite={$satelliteStore} />
						{:else if $store.tabId === $store.tabs[1].id}
							<HostingSettings satellite={$satelliteStore} />
						{/if}
					{/if}
				</MissionControlGuard>
			</Tabs>
		</SatelliteGuard>
	</Loaders>
</IdentityGuard>

