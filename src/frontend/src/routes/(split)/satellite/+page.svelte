<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import SatelliteOverview from '$lib/components/satellites/SatelliteOverview.svelte';
	import SatelliteSettings from '$lib/components/satellites/SatelliteSettings.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { satelliteStore } from '$lib/derived/satellite/satellite.derived';
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
			labelKey: 'satellites.satellite'
		},
		{
			id: Symbol('2'),
			labelKey: 'core.setup'
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
	<Loaders monitoring>
		<SatelliteGuard>
			<Tabs>
				{#snippet info()}
					{#if nonNullish($satelliteStore)}
						<Warnings satellite={$satelliteStore} />
					{/if}
				{/snippet}

				<MissionControlGuard>
					{#if nonNullish($satelliteStore) && nonNullish($missionControlId)}
						{#if $store.tabId === $store.tabs[0].id}
							<SatelliteOverview satellite={$satelliteStore} />
						{:else if $store.tabId === $store.tabs[1].id}
							<SatelliteSettings satellite={$satelliteStore} />
						{/if}
					{/if}
				</MissionControlGuard>
			</Tabs>
		</SatelliteGuard>
	</Loaders>
</IdentityGuard>
