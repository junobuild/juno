<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { setContext, untrack } from 'svelte';
	import { writable } from 'svelte/store';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
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
	import { i18n } from '$lib/stores/app/i18n.store';

	const tabDashboard = {
		id: Symbol('1'),
		labelKey: 'core.dashboard'
	};

	let tabs: Tab[] = $derived([
		tabDashboard,
		...($hasMissionControlSettings
			? [
					{
						id: Symbol('2'),
						labelKey: 'core.setup'
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

	$effect(() => {
		store.set({
			tabId: initTabId(tabs),
			tabs
		});
	});

	let TabsCmp = $derived($hasMissionControlSettings ? Tabs : NoTabs);
</script>

<IdentityGuard>
	<TabsCmp>
		{#snippet info()}
			{#if $authSignedIn}
				<Warnings />
			{/if}
		{/snippet}

		<Loaders monitoring>
			<MissionControlGuard notFoundDescription={$i18n.monitoring.requires_mission_control}>
				{#if nonNullish($missionControlId)}
					<MissionControlDataLoader missionControlId={$missionControlId} reload>
						{#if $store.tabId === $store.tabs[0].id}
							<MonitoringDashboard missionControlId={$missionControlId} />
						{:else if $store.tabId === $store.tabs[1].id && $hasMissionControlSettings}
							<MonitoringSettings missionControlId={$missionControlId} />
						{/if}
					</MissionControlDataLoader>
				{/if}
			</MissionControlGuard>
		</Loaders>
	</TabsCmp>
</IdentityGuard>
