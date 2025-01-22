<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import CanistersLoader from '$lib/components/loaders/CanistersLoader.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import Logs from '$lib/components/logs/Logs.svelte';
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
			labelKey: 'functions.logs'
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
	<Tabs help="https://juno.build/docs/build/functions">
		<WalletLoader>
			<SatellitesLoader>
				<SatelliteGuard>
					<CanistersLoader>
						{#if nonNullish($satelliteStore)}
							<Logs satelliteId={$satelliteStore.satellite_id} />
						{/if}
					</CanistersLoader>
				</SatelliteGuard>
			</SatellitesLoader>
		</WalletLoader>
	</Tabs>
</IdentityGuard>
