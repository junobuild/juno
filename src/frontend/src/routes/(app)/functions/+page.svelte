<script lang="ts">
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { writable } from 'svelte/store';
	import type { Tab, TabsContext, TabsStore } from '$lib/types/tabs.context';
	import { setContext } from 'svelte';
	import { TABS_CONTEXT_KEY } from '$lib/types/tabs.context';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { initTabId } from '$lib/utils/tabs.utils';
	import Logs from '$lib/components/functions/Logs.svelte';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'functions.logs'
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
	<Tabs help="https://juno.build/docs/build/functions">
		<SatelliteGuard>
			{#if nonNullish($satelliteStore)}
				<Logs satelliteId={$satelliteStore.satellite_id} />
			{/if}
		</SatelliteGuard>
	</Tabs>
</IdentityGuard>
