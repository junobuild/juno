<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import ChangesDock from '$lib/components/upgrade/changes/ChangesDock.svelte';
	import UpgradeDock from '$lib/components/upgrade/dock/UpgradeDock.svelte';
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
			labelKey: 'upgrade.releases'
		},
		{
			id: Symbol('2'),
			labelKey: 'upgrade.changes'
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
		<Loaders>
			<MissionControlGuard>
				{#if nonNullish($missionControlIdDerived)}
					{#if $store.tabId === $store.tabs[0].id}
						<UpgradeDock missionControlId={$missionControlIdDerived} />
					{:else if $store.tabId === $store.tabs[1].id}
						<ChangesDock />
					{/if}
				{/if}
			</MissionControlGuard>
		</Loaders>
	</Tabs>
</IdentityGuard>
