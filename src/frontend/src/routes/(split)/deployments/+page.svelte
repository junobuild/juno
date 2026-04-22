<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Loaders from '$lib/components/app/loaders/Loaders.svelte';
	import IdentityGuard from '$lib/components/auth/guards/IdentityGuard.svelte';
	import Automation from '$lib/components/satellites/automation/Automation.svelte';
	import AutomationSettings from '$lib/components/satellites/automation/AutomationSettings.svelte';
	import SatelliteGuard from '$lib/components/satellites/guards/SatelliteGuard.svelte';
	import NoTabs from '$lib/components/ui/NoTabs.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';
	import {
		type Tab,
		type TabsContext,
		type TabsData,
		TABS_CONTEXT_KEY
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'automation.title'
		},
		{
			id: Symbol('2'),
			labelKey: 'core.settings'
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
					{:else if $store.tabId === $store.tabs[1].id}
						<AutomationSettings {satellite} />
					{/if}
				</TabsCmp>
			{/snippet}
		</SatelliteGuard>
	</Loaders>
</IdentityGuard>
