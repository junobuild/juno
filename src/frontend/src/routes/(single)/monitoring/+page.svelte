<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { run } from 'svelte/legacy';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import ObservatoryDashboard from '$lib/components/observatory/ObservatoryDashboard.svelte';
	import ObservatorySettings from '$lib/components/observatory/ObservatorySettings.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
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
			labelKey: 'observatory.dashboard'
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

	run(() => {
		store.set({
			tabId: initTabId(tabs),
			tabs
		});
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
