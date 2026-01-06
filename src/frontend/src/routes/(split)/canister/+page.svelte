<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import CanisterGuard from '$lib/components/guards/CanisterGuard.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import SatelliteOverview from '$lib/components/satellites/SatelliteOverview.svelte';
	import SatelliteSettings from '$lib/components/satellites/setup/SatelliteSettings.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsData
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';
	import {canisterStore} from "$lib/derived/canister.derived";

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'core.service'
		}
	];

	const store = writable<TabsData>({
		tabId: initTabId(tabs),
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});

	// TODO: Warnings for {satellite} or {canister}
</script>

<IdentityGuard>
	<Loaders monitoring>
		<CanisterGuard>
			<Tabs>
				{#snippet info()}
					{#if nonNullish($satelliteStore)}
						<Warnings satellite={$satelliteStore} />
					{/if}
				{/snippet}

				{#if nonNullish($canisterStore)}
					{#if $store.tabId === $store.tabs[0].id}
						<SatelliteOverview satellite={$satelliteStore} />

						<SatelliteSettings satellite={$satelliteStore} />
					{/if}
				{/if}
			</Tabs>
		</CanisterGuard>
	</Loaders>
</IdentityGuard>
