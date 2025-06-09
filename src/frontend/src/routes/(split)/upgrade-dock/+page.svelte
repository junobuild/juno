<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import OrbitersLoader from '$lib/components/loaders/OrbitersLoader.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import UpgradeDock from '$lib/components/upgrade/dock/UpgradeDock.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsData
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';
	import ChangesDock from '$lib/components/upgrade/changes/ChangesDock.svelte';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'upgrade_dock.releases'
		},
		{
			id: Symbol('2'),
			labelKey: 'upgrade_dock.changes'
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
	<Tabs help="https://juno.build/docs/build/authentication">
		<WalletLoader>
			<SatellitesLoader>
				<OrbitersLoader>
					<MissionControlGuard>
						{#if nonNullish($missionControlIdDerived)}
							{#if $store.tabId === $store.tabs[0].id}
								<UpgradeDock missionControlId={$missionControlIdDerived} />
							{:else if $store.tabId === $store.tabs[1].id}
								<ChangesDock missionControlId={$missionControlIdDerived} />
							{/if}
						{/if}
					</MissionControlGuard>
				</OrbitersLoader>
			</SatellitesLoader>
		</WalletLoader>
	</Tabs>
</IdentityGuard>
