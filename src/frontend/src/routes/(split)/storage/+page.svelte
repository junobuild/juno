<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import CanistersLoader from '$lib/components/loaders/CanistersLoader.svelte';
	import SatelliteVersionLoader from '$lib/components/loaders/SatelliteVersionLoader.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import Storage from '$lib/components/storage/Storage.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import WalletLoader from '$lib/components/loaders/WalletLoader.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import {
		type Tab,
		type TabsContext,
		type TabsData,
		TABS_CONTEXT_KEY
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';
	import Loaders from '$lib/components/loaders/Loaders.svelte';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'storage.title'
		},
		{
			id: Symbol('2'),
			labelKey: 'collections.title'
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
	<Tabs help="https://juno.build/docs/build/storage">
		<Loaders>
			<SatelliteGuard>
				{#if nonNullish($satelliteStore) && nonNullish($missionControlIdDerived)}
					<SatelliteVersionLoader
						satellite={$satelliteStore}
						missionControlId={$missionControlIdDerived}
					>
						<Storage satelliteId={$satelliteStore?.satellite_id} />
					</SatelliteVersionLoader>
				{/if}
			</SatelliteGuard>
		</Loaders>
	</Tabs>
</IdentityGuard>
