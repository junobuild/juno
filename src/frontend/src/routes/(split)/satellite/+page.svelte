<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import SatelliteVersionLoader from '$lib/components/loaders/SatelliteVersionLoader.svelte';
	import SatelliteOverview from '$lib/components/satellites/SatelliteOverview.svelte';
	import SatelliteSettings from '$lib/components/satellites/SatelliteSettings.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
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
	<Tabs
		help={$store.tabId === $store.tabs[0].id
			? 'https://juno.build/docs/add-juno-to-an-app/install-the-sdk-and-initialize-juno'
			: 'https://juno.build/docs/miscellaneous/settings'}
	>
		{#snippet info()}
			{#if nonNullish($satelliteStore)}
				<Warnings satellite={$satelliteStore} />
			{/if}
		{/snippet}

		<Loaders monitoring>
			<SatelliteGuard>
				<MissionControlGuard>
					{#if nonNullish($satelliteStore) && nonNullish($missionControlIdDerived)}
						<SatelliteVersionLoader
							satellite={$satelliteStore}
							missionControlId={$missionControlIdDerived}
						>
							{#if $store.tabId === $store.tabs[0].id}
								<SatelliteOverview satellite={$satelliteStore} />
							{:else if $store.tabId === $store.tabs[1].id}
								<SatelliteSettings satellite={$satelliteStore} />
							{/if}
						</SatelliteVersionLoader>
					{/if}
				</MissionControlGuard>
			</SatelliteGuard>
		</Loaders>
	</Tabs>
</IdentityGuard>
