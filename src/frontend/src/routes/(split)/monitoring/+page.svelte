<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext, untrack } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import MissionControl from '$lib/components/mission-control/MissionControl.svelte';
	import MissionControlDataLoader from '$lib/components/mission-control/MissionControlDataLoader.svelte';
	import MonitoringDashboard from '$lib/components/monitoring/MonitoringDashboard.svelte';
	import MonitoringSettings from '$lib/components/monitoring/MonitoringSettings.svelte';
	import NoTabs from '$lib/components/ui/NoTabs.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { hasMissionControlSettings } from '$lib/derived/mission-control/mission-control-settings.derived';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsData
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';

	let tabs = $derived<Tab[]>([
		{
			id: Symbol('1'),
			labelKey: $hasMissionControlSettings ? 'core.dashboard' : 'monitoring.title'
		},
		...($hasMissionControlSettings
			? [
					{
						id: Symbol('2'),
						labelKey: 'core.config'
					}
				]
			: []),
		{
			id: Symbol('3'),
			labelKey: 'mission_control.title'
		}
	]);

	const store = writable<TabsData>({
		tabId: untrack(() => initTabId(tabs)),
		tabs: untrack(() => tabs)
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});

	$effect(() => {
		store.set({
			tabId: initTabId(tabs),
			tabs
		});
	});

	let TabsCmp = $derived(nonNullish($missionControlId) ? Tabs : NoTabs);
</script>

<IdentityGuard>
	<TabsCmp>
		{#snippet info()}
			{#if $authSignedIn}
				<Warnings />
			{/if}
		{/snippet}

		<Loaders monitoring>
			<MissionControlGuard>
				{#snippet content(missionControlId)}
					<MissionControlDataLoader {missionControlId} reload>
						{#if $store.tabId === $store.tabs[0].id}
							<MonitoringDashboard {missionControlId} />
						{:else if $hasMissionControlSettings}
							{#if $store.tabId === $store.tabs[1].id}
								<MonitoringSettings {missionControlId} />
							{:else if $store.tabId === $store.tabs[2].id}
								<MissionControl {missionControlId} />
							{/if}
						{:else if $store.tabId === $store.tabs[1].id}
							<MissionControl {missionControlId} />
						{/if}
					</MissionControlDataLoader>
				{/snippet}
			</MissionControlGuard>
		</Loaders>
	</TabsCmp>
</IdentityGuard>
