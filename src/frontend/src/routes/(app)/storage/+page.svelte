<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import Storage from '$lib/components/storage/Storage.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import {
		type Tab,
		type TabsContext,
		type TabsStore,
		TABS_CONTEXT_KEY
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'storage.title'
		},
		{
			id: Symbol('2'),
			labelKey: 'collections.title'
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
	<Tabs help="https://juno.build/docs/build/storage">
		<SatelliteGuard>
			{#if nonNullish($satelliteStore)}
				<Storage satelliteId={$satelliteStore?.satellite_id} />
			{/if}
		</SatelliteGuard>
	</Tabs>
</IdentityGuard>
