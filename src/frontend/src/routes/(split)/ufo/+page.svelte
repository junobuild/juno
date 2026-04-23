<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Loaders from '$lib/components/app/loaders/Loaders.svelte';
	import IdentityGuard from '$lib/components/auth/guards/IdentityGuard.svelte';
	import Warnings from '$lib/components/modules/warning/Warnings.svelte';
	import UfoGuard from '$lib/components/ufos/guards/UfoGuard.svelte';
	import UfoOverview from '$lib/components/ufos/overview/UfoOverview.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
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
			labelKey: 'ufo.title'
		},
		{
			id: Symbol('2'),
			labelKey: 'core.setup'
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
	<Loaders monitoring>
		<UfoGuard>
			{#snippet content(ufo)}
				<Tabs>
					{#snippet info()}
						<Warnings />
					{/snippet}

					{#if $store.tabId === $store.tabs[0].id}
						<UfoOverview {ufo} />
					{:else if $store.tabId === $store.tabs[1].id}
						TODO
					{/if}
				</Tabs>
			{/snippet}
		</UfoGuard>
	</Loaders>
</IdentityGuard>
