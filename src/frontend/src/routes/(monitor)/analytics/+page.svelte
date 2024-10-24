<script lang="ts">
	import { run } from 'svelte/legacy';

	import { nonNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Analytics from '$lib/components/analytics/Analytics.svelte';
	import AnalyticsSettings from '$lib/components/analytics/AnalyticsSettings.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import Orbiter from '$lib/components/orbiter/Orbiter.svelte';
	import OrbiterConfig from '$lib/components/orbiter/OrbiterConfig.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { loadOrbiterVersion } from '$lib/services/console.services';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import {
		type Tab,
		type TabsContext,
		type TabsStore,
		TABS_CONTEXT_KEY
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';

	const tabDashboard = {
		id: Symbol('1'),
		labelKey: 'analytics.dashboard'
	};

	let tabs: Tab[] = $state([tabDashboard]);
	run(() => {
		tabs = [
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
	});

	const store = writable<TabsStore>({
		tabId: initTabId(tabs),
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});

	run(() => {
		store.set({
			tabId: initTabId(tabs),
			tabs
		});
	});

	// Load data

	run(() => {
		$missionControlStore,
			(async () => await loadOrbiters({ missionControl: $missionControlStore }))();
	});

	run(() => {
		$orbiterStore,
			(async () => await loadOrbiterVersion({ orbiter: $orbiterStore, reload: false }))();
	});
</script>

<svelte:window
	onjunoReloadVersions={async () =>
		await loadOrbiterVersion({ orbiter: $orbiterStore, reload: true })}
/>

<IdentityGuard>
	<Tabs
		help={$store.tabId === $store.tabs[0].id
			? 'https://juno.build/docs/build/analytics'
			: 'https://juno.build/docs/miscellaneous/settings'}
	>
		{#snippet info()}
			{#if $authSignedInStore}
				<Warnings />
			{/if}
		{/snippet}

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
