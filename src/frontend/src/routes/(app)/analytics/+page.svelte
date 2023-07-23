<script lang="ts">
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { writable } from 'svelte/store';
	import type { Tab, TabsContext, TabsStore } from '$lib/types/tabs.context';
	import { setContext } from 'svelte';
	import { TABS_CONTEXT_KEY } from '$lib/types/tabs.context';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import { nonNullish } from '$lib/utils/utils';
	import Analytics from '$lib/components/analytics/Analytics.svelte';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'analytics.metrics'
		}
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
	<Tabs help="https://juno.build/docs/build/datastore">
		<SatelliteGuard>
			{#if nonNullish($satelliteStore)}
				<Analytics satelliteId={$satelliteStore.satellite_id} />
			{/if}
		</SatelliteGuard>
	</Tabs>
</IdentityGuard>
