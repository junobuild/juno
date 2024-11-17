<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControl from '$lib/components/mission-control/MissionControl.svelte';
	import MissionControlSettings from '$lib/components/mission-control/MissionControlSettings.svelte';
	import MissionControlWallet from '$lib/components/mission-control/MissionControlWallet.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
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
		{#snippet info()}
			{#if $authSignedInStore}
				<Warnings />
			{/if}
		{/snippet}

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
