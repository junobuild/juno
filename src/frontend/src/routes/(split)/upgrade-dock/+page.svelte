<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import CanistersLoader from '$lib/components/loaders/CanistersLoader.svelte';
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

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'upgrade_dock.releases'
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
					<CanistersLoader>
						<MissionControlGuard>
							{#if nonNullish($missionControlIdDerived)}
								<UpgradeDock missionControlId={$missionControlIdDerived} />
							{/if}
						</MissionControlGuard>
					</CanistersLoader>
				</OrbitersLoader>
			</SatellitesLoader>
		</WalletLoader>
	</Tabs>
</IdentityGuard>
