<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { setContext, untrack } from 'svelte';
	import { run } from 'svelte/legacy';
	import { writable } from 'svelte/store';
	import Analytics from '$lib/components/analytics/Analytics.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import Orbiter from '$lib/components/orbiter/Orbiter.svelte';
	import OrbiterConfig from '$lib/components/orbiter/OrbiterConfig.svelte';
	import OrbiterSettings from '$lib/components/orbiter/setup/OrbiterSettings.svelte';
	import NoTabs from '$lib/components/ui/NoTabs.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import {
		type Tab,
		type TabsContext,
		type TabsData,
		TABS_CONTEXT_KEY
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';

	const tabDashboard = {
		id: Symbol('1'),
		labelKey: 'core.dashboard'
	};

	let tabs: Tab[] = $derived([
		tabDashboard,
		...(nonNullish($orbiterStore)
			? [
					{
						id: Symbol('2'),
						labelKey: 'core.config'
					},
					{
						id: Symbol('3'),
						labelKey: 'analytics.orbiter'
					}
				]
			: [])
	]);

	const store = writable<TabsData>({
		tabId: untrack(() => initTabId(tabs)),
		tabs: untrack(() => tabs)
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

	let TabsCmp = $derived(isNullish($orbiterStore) ? NoTabs : Tabs);
</script>

<IdentityGuard>
	<TabsCmp>
		{#snippet info()}
			{#if $authSignedIn}
				<Warnings />
			{/if}
		{/snippet}

		<Loaders>
			{#if $store.tabId === $store.tabs[0].id}
				<Analytics />
			{:else if $store.tabId === $store.tabs[2].id && nonNullish($orbiterStore)}
				<Orbiter orbiter={$orbiterStore} />

				<OrbiterSettings orbiterId={$orbiterStore.orbiter_id} />
			{:else if $store.tabId === $store.tabs[1].id && nonNullish($orbiterStore)}
				<OrbiterConfig orbiterId={$orbiterStore.orbiter_id} />
			{/if}
		</Loaders>
	</TabsCmp>
</IdentityGuard>
