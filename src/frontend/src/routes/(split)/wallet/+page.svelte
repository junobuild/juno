<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import NoTabs from '$lib/components/ui/NoTabs.svelte';
	import Wallet from '$lib/components/wallet/Wallet.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
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
			<MissionControlGuard>
				{#if nonNullish($missionControlIdDerived)}
					{#if $store.tabId === $store.tabs[0].id}
						<Wallet missionControlId={$missionControlIdDerived} />
					{/if}
				{/if}
			</MissionControlGuard>
		</Loaders>
	</NoTabs>
</IdentityGuard>
