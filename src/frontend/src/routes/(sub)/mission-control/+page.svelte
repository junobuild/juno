<script lang="ts">
	import MissionControl from '$lib/components/mission-control/MissionControl.svelte';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsStore
	} from '$lib/types/tabs.context';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import MissionControlWallet from '$lib/components/mission-control/MissionControlWallet.svelte';
	import { initTabId } from '$lib/utils/tabs.utils';
	import MissionControlSettings from '$lib/components/mission-control/MissionControlSettings.svelte';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'mission_control.title'
		},
		{
			id: Symbol('2'),
			labelKey: 'wallet.title'
		},
		{
			id: Symbol('3'),
			labelKey: 'core.settings'
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
			? 'https://juno.build/docs/architecture'
			: 'https://juno.build/docs/miscellaneous/settings'}
	>
		<svelte:fragment slot="info">
			{#if $authSignedInStore}
				<Warnings />
			{/if}
		</svelte:fragment>

		{#if nonNullish($missionControlStore)}
			{#if $store.tabId === $store.tabs[0].id}
				<MissionControl />
			{:else if $store.tabId === $store.tabs[1].id}
				<MissionControlWallet missionControlId={$missionControlStore} />
			{:else if $store.tabId === $store.tabs[2].id}
				<MissionControlSettings missionControlId={$missionControlStore} />
			{/if}
		{/if}
	</Tabs>
</IdentityGuard>
