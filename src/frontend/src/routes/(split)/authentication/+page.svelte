<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import AuthSettings from '$lib/components/auth/AuthSettings.svelte';
	import Users from '$lib/components/auth/Users.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import {
		type Tab,
		type TabsContext,
		type TabsStore,
		TABS_CONTEXT_KEY
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'authentication.users'
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
	<Tabs help="https://juno.build/docs/build/authentication">
		<WalletLoader>
			<SatellitesLoader>
				<SatelliteGuard>
					{#if nonNullish($satelliteStore)}
						{#if $store.tabId === $store.tabs[0].id}
							<Users satelliteId={$satelliteStore.satellite_id} />
						{:else if $store.tabId === $store.tabs[1].id}
							<AuthSettings satellite={$satelliteStore} />
						{/if}
					{/if}
				</SatelliteGuard>
			</SatellitesLoader>
		</WalletLoader>
	</Tabs>
</IdentityGuard>
