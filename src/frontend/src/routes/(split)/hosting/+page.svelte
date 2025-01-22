<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import Hosting from '$lib/components/hosting/Hosting.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsStore
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';
	import CanisterCyclesLoader from '$lib/components/loaders/CanisterCyclesLoader.svelte';

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
		<WalletLoader>
			<SatellitesLoader>
				<SatelliteGuard>
					<MissionControlGuard>
						<CanisterCyclesLoader>
							{#if nonNullish($satelliteStore)}
								{#if $store.tabId === $store.tabs[0].id}
									<Hosting satellite={$satelliteStore} />
								{/if}
							{/if}
						</CanisterCyclesLoader>
					</MissionControlGuard>
				</SatelliteGuard>
			</SatellitesLoader>
		</WalletLoader>
	</Tabs>
</IdentityGuard>
