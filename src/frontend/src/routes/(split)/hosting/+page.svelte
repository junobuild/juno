<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import Hosting from '$lib/components/hosting/Hosting.svelte';
	import CanistersLoader from '$lib/components/loaders/CanistersLoader.svelte';
	import SatelliteVersionLoader from '$lib/components/loaders/SatelliteVersionLoader.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
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
			labelKey: 'hosting.title'
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
	<Tabs help="https://juno.build/docs/build/hosting">
		<WalletLoader>
			<SatellitesLoader>
				<SatelliteGuard>
					<MissionControlGuard>
						<CanistersLoader>
							{#if nonNullish($satelliteStore) && nonNullish($missionControlIdDerived)}
								<SatelliteVersionLoader
									satellite={$satelliteStore}
									missionControlId={$missionControlIdDerived}
								>
									{#if $store.tabId === $store.tabs[0].id}
										<Hosting satellite={$satelliteStore} />
									{/if}
								</SatelliteVersionLoader>
							{/if}
						</CanistersLoader>
					</MissionControlGuard>
				</SatelliteGuard>
			</SatellitesLoader>
		</WalletLoader>
	</Tabs>
</IdentityGuard>
