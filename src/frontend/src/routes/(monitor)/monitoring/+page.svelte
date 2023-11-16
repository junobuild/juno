<script lang="ts">
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
	import ObservatorySettings from '$lib/components/observatory/ObservatorySettings.svelte';
	import ObservatoryDashboard from '$lib/components/observatory/ObservatoryDashboard.svelte';
	import { initTabId } from '$lib/utils/tabs.utils';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'observatory.dashboard'
		},
		{
			id: Symbol('2'),
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

	$: store.set({
		tabId: initTabId(tabs),
		tabs
	});
</script>

<IdentityGuard>
	<Tabs help="https://juno.build/docs/miscellaneous/monitoring">
		{#if $store.tabId === $store.tabs[0].id}
			<ObservatoryDashboard />
		{:else if $store.tabId === $store.tabs[1].id && nonNullish($missionControlStore)}
			<ObservatorySettings missionControlId={$missionControlStore} />
		{/if}
	</Tabs>
</IdentityGuard>
