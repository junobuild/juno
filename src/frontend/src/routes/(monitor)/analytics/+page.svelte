<script lang="ts">
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { writable } from 'svelte/store';
	import type { Tab, TabsContext, TabsStore } from '$lib/types/tabs.context';
	import { setContext } from 'svelte';
	import { TABS_CONTEXT_KEY } from '$lib/types/tabs.context';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import Analytics from '$lib/components/analytics/Analytics.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import OrbiterConfig from '$lib/components/orbiter/OrbiterConfig.svelte';
	import Orbiter from '$lib/components/orbiter/Orbiter.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { loadOrbiterVersion } from '$lib/services/console.services';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { initTabId } from '$lib/utils/tabs.utils';
	import AnalyticsSettings from '$lib/components/analytics/AnalyticsSettings.svelte';

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
						labelKey: 'analytics.overview'
					},
					{
						id: Symbol('3'),
						labelKey: 'core.settings'
					}
				]
			: [])
	];

	const store = writable<TabsStore>({
		tabId: initTabId(tabs),
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});

	$: store.set({
		tabId: initTabId(tabs),
		tabs
	});

	// Load data

	$: $missionControlStore,
		(async () => await loadOrbiters({ missionControl: $missionControlStore }))();

	$: $orbiterStore,
		(async () => await loadOrbiterVersion({ orbiter: $orbiterStore, reload: false }))();
</script>

<svelte:window
	on:junoReloadVersions={async () =>
		await loadOrbiterVersion({ orbiter: $orbiterStore, reload: true })}
/>

<IdentityGuard>
	<Tabs
		help={$store.tabId === $store.tabs[0].id
			? 'https://juno.build/docs/build/analytics'
			: 'https://juno.build/docs/miscellaneous/settings'}
	>
		<svelte:fragment slot="info">
			{#if $authSignedInStore}
				<Warnings />
			{/if}
		</svelte:fragment>

		<MissionControlGuard>
			{#if $store.tabId === $store.tabs[0].id}
				<Analytics />
			{:else if $store.tabId === $store.tabs[1].id && nonNullish($orbiterStore)}
				<Orbiter orbiter={$orbiterStore} />
			{:else if $store.tabId === $store.tabs[2].id && nonNullish($orbiterStore)}
				<OrbiterConfig orbiterId={$orbiterStore.orbiter_id} />

				<AnalyticsSettings orbiterId={$orbiterStore.orbiter_id} />
			{/if}
		</MissionControlGuard>
	</Tabs>
</IdentityGuard>
