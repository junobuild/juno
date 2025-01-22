<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Guides from '$lib/components/examples/Guides.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import CanistersLoader from '$lib/components/loaders/CanistersLoader.svelte';
	import OrbitersLoader from '$lib/components/loaders/OrbitersLoader.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import SatelliteOverview from '$lib/components/satellites/SatelliteOverview.svelte';
	import SatelliteSettings from '$lib/components/satellites/SatelliteSettings.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsStore
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

	const store = writable<TabsStore>({
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

		<WalletLoader>
			<SatellitesLoader>
				<OrbitersLoader>
					<SatelliteGuard>
						<MissionControlGuard>
							{#if nonNullish($satelliteStore)}
								<CanistersLoader monitoring satellites={[$satelliteStore]}>
									{#if $store.tabId === $store.tabs[0].id}
										<SatelliteOverview satellite={$satelliteStore} />

										<Guides />
									{:else if $store.tabId === $store.tabs[1].id}
										<SatelliteSettings satellite={$satelliteStore} />
									{/if}
								</CanistersLoader>
							{/if}
						</MissionControlGuard>
					</SatelliteGuard>
				</OrbitersLoader>
			</SatellitesLoader>
		</WalletLoader>
	</Tabs>
</IdentityGuard>
