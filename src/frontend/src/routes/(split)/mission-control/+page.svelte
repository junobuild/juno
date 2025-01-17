<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import MissionControl from '$lib/components/mission-control/MissionControl.svelte';
	import MissionControlSettings from '$lib/components/mission-control/MissionControlSettings.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
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
			labelKey: 'mission_control.title'
		},
		{
			id: Symbol('3'),
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
			? 'https://juno.build/docs/terminology#mission-control'
			: 'https://juno.build/docs/miscellaneous/settings'}
	>
		{#snippet info()}
			{#if $authSignedIn}
				<Warnings />
			{/if}
		{/snippet}

		<WalletLoader>
			<SatellitesLoader>
				<MissionControlGuard>
					{#if nonNullish($missionControlIdDerived)}
						{#if $store.tabId === $store.tabs[0].id}
							<MissionControl missionControlId={$missionControlIdDerived} />
						{:else if $store.tabId === $store.tabs[1].id}
							<MissionControlSettings missionControlId={$missionControlIdDerived} />
						{/if}
					{/if}
				</MissionControlGuard>
			</SatellitesLoader>
		</WalletLoader>
	</Tabs>
</IdentityGuard>
