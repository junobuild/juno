<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Loaders from '$lib/components/app/loaders/Loaders.svelte';
	import IdentityGuard from '$lib/components/auth/guards/IdentityGuard.svelte';
	import Warnings from '$lib/components/modules/warning/Warnings.svelte';
	import NoTabs from '$lib/components/ui/NoTabs.svelte';
	import Wallet from '$lib/components/wallet/Wallet.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
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
			labelKey: 'wallet.title'
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
	<NoTabs>
		{#snippet info()}
			{#if $authSignedIn}
				<Warnings />
			{/if}
		{/snippet}

		<Loaders>
			{#if $store.tabId === $store.tabs[0].id}
				<Wallet />
			{/if}
		</Loaders>
	</NoTabs>
</IdentityGuard>
