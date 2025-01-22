<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext, untrack } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import CanistersLoader from '$lib/components/loaders/CanistersLoader.svelte';
	import OrbitersLoader from '$lib/components/loaders/OrbitersLoader.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import MissionControlDataLoader from '$lib/components/mission-control/MissionControlDataLoader.svelte';
	import MonitoringDashboard from '$lib/components/monitoring/MonitoringDashboard.svelte';
	import MonitoringSettings from '$lib/components/monitoring/MonitoringSettings.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { hasMissionControlSettings } from '$lib/derived/mission-control-settings.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsStore
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';

	const tabDashboard = {
		id: Symbol('1'),
		labelKey: 'core.dashboard'
	};

	let tabs: Tab[] = $derived([
		tabDashboard,
		...($hasMissionControlSettings
			? [
					{
						id: Symbol('2'),
						labelKey: 'core.setup'
					}
				]
			: [])
	]);

	const store = writable<TabsStore>({
		tabId: untrack(() => initTabId(tabs)),
		tabs: untrack(() => tabs)
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});

	$effect(() => {
		store.set({
			tabId: initTabId(tabs),
			tabs
		});
	});
</script>

<IdentityGuard>
	<Tabs help="https://juno.build/docs/management/monitoring">
		{#snippet info()}
			{#if $authSignedIn}
				<Warnings />
			{/if}
		{/snippet}

		<WalletLoader>
			<SatellitesLoader>
				<OrbitersLoader>
					<MissionControlGuard>
						<CanistersLoader monitoring satellites={$sortedSatellites}>
							{#if nonNullish($missionControlIdDerived)}
								<MissionControlDataLoader missionControlId={$missionControlIdDerived} reload>
									{#if $store.tabId === $store.tabs[0].id}
										<MonitoringDashboard missionControlId={$missionControlIdDerived} />
									{:else if $store.tabId === $store.tabs[1].id && $hasMissionControlSettings}
										<MonitoringSettings missionControlId={$missionControlIdDerived} />
									{/if}
								</MissionControlDataLoader>
							{/if}
						</CanistersLoader>
					</MissionControlGuard>
				</OrbitersLoader>
			</SatellitesLoader>
		</WalletLoader>
	</Tabs>
</IdentityGuard>
