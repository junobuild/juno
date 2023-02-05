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
	import Transactions from '$lib/components/mission-control/Transactions.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			name: $i18n.mission_control.title
		}
		// TODO: implement and add transactions tab when ICP index canisters makes it to mainnet
		// {
		// 	id: Symbol('2'),
		// 	name: $i18n.mission_control.transactions
		// }
	];

	const store = writable<TabsStore>({
		tabId: tabs[0].id,
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});
</script>

<IdentityGuard>
	<Tabs help="https://juno.build/docs/architecture">
		{#if $store.tabId === $store.tabs[0].id}
			<MissionControl />
		{:else if $store.tabId === $store.tabs[1].id}
			<Transactions />
		{/if}
	</Tabs>
</IdentityGuard>
