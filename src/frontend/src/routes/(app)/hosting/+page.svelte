<script lang="ts">
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsStore
	} from '$lib/types/tabs.context';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import Hosting from '$lib/components/hosting/Hosting.svelte';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { nonNullish } from '$lib/utils/utils';
	import { initTabId } from '$lib/utils/tabs.utils';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'hosting.title'
		}
	];

	const store = writable<TabsStore>({
		tabId: initTabId(tabs),
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});
</script>

<IdentityGuard>
	<Tabs help="https://juno.build/docs/build/hosting">
		<SatelliteGuard>
			<MissionControlGuard>
				{#if nonNullish($satelliteStore)}
					{#if $store.tabId === $store.tabs[0].id}
						<Hosting satellite={$satelliteStore} />
					{/if}
				{/if}
			</MissionControlGuard>
		</SatelliteGuard>
	</Tabs>
</IdentityGuard>
