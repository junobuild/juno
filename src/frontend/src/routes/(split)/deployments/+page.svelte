<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Loaders from '$lib/components/app/loaders/Loaders.svelte';
	import IdentityGuard from '$lib/components/auth/guards/IdentityGuard.svelte';
	import Automation from '$lib/components/satellites/automation/Automation.svelte';
	import SatelliteGuard from '$lib/components/satellites/guards/SatelliteGuard.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import {
		type Tab,
		type TabsContext,
		type TabsData,
		TABS_CONTEXT_KEY
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';
	import { nonNullish } from '@dfinity/utils';
	import NoTabs from '$lib/components/ui/NoTabs.svelte';
	import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'automation.title'
		}
	];

	const store = writable<TabsData>({
		tabId: initTabId(tabs),
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});

	let TabsCmp = $derived(nonNullish($satelliteAutomationConfig) ? Tabs : NoTabs);
</script>

<IdentityGuard>
	<Loaders satelliteConfig>
		<SatelliteGuard>
			{#snippet content(satellite)}
				<TabsCmp>
					{#if $store.tabId === $store.tabs[0].id}
						<Automation {satellite} />
					{/if}
				</TabsCmp>
			{/snippet}
		</SatelliteGuard>
	</Loaders>
</IdentityGuard>
