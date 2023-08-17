<script lang="ts">
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { writable } from 'svelte/store';
	import type { Tab, TabsContext, TabsStore } from '$lib/types/tabs.context';
	import { setContext } from 'svelte';
	import { TABS_CONTEXT_KEY } from '$lib/types/tabs.context';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import Analytics from '$lib/components/analytics/Analytics.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import AnalyticsControllers from '$lib/components/analytics/AnalyticsControllers.svelte';
	import { nonNullish } from '$lib/utils/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import AnalyticsOriginFilters from "$lib/components/analytics/AnalyticsOriginFilters.svelte";

	const tabDashboard = {
		id: Symbol('1'),
		labelKey: 'analytics.dashboard'
	};

	let tabs: Tab[] = [tabDashboard];
	$: tabs = [
		tabDashboard,
		...(nonNullish($orbiterStore)
			? [
					{
						id: Symbol('2'),
						labelKey: 'core.settings'
					}
			  ]
			: [])
	];

	const store = writable<TabsStore>({
		tabId: tabs[0].id,
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});

	$: store.set({
		tabId: tabs[0].id,
		tabs
	});
</script>

<IdentityGuard>
	<Tabs help="https://juno.build/docs/build/datastore">
		<MissionControlGuard>
			{#if $store.tabId === $store.tabs[0].id}
				<Analytics />
			{:else if $store.tabId === $store.tabs[1].id && nonNullish($orbiterStore)}
				<AnalyticsOriginFilters orbiterId={$orbiterStore.orbiter_id} />

				<AnalyticsControllers orbiterId={$orbiterStore.orbiter_id} />
			{/if}
		</MissionControlGuard>
	</Tabs>
</IdentityGuard>
