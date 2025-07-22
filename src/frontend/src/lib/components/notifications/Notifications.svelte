<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconNotifications from '$lib/components/icons/IconNotifications.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import NotificationsCanister from '$lib/components/notifications/NotificationsCanister.svelte';
	import NotificationsCanisterLoader from '$lib/components/notifications/NotificationsCanisterLoader.svelte';
	import NotificationsUpgrade from '$lib/components/notifications/NotificationsUpgrade.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import TabsSegment from '$lib/components/ui/TabsSegment.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { versionsLoaded, versionsUpgradeWarning } from '$lib/derived/version.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData } from '$lib/types/canister';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsData
	} from '$lib/types/tabs.context';
	import { overviewLink } from '$lib/utils/nav.utils';
	import { initTabId } from '$lib/utils/tabs.utils';

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const close = () => (visible = false);

	const onclick = () => (visible = true);

	let missionControlCanisterData = $state<CanisterData | undefined>(undefined);
	let missionControlCyclesWarning = $state(false);
	let missionControlHeapWarning = $state(false);

	let missionControlWarnings = $derived(missionControlCyclesWarning || missionControlHeapWarning);

	let orbiterCanisterData = $state<CanisterData | undefined>(undefined);
	let orbiterCyclesWarning = $state(false);
	let orbiterHeapWarning = $state(false);

	let orbiterWarnings = $derived(orbiterCyclesWarning || orbiterHeapWarning);

	let satelliteCanisterData = $state<CanisterData | undefined>(undefined);
	let satelliteCyclesWarning = $state(false);
	let satelliteHeapWarning = $state(false);

	let satelliteWarnings = $derived(satelliteCyclesWarning || satelliteHeapWarning);

	let hasCanisterNotifications = $derived(
		missionControlWarnings || orbiterWarnings || satelliteWarnings
	);

	let hasUpgradeWarning = $derived($versionsLoaded && $versionsUpgradeWarning);

	let level = $derived<'warning' | 'info' | 'error' | undefined>(
		hasCanisterNotifications || hasUpgradeWarning ? 'warning' : undefined
	);

	let hasNotifications = $derived(
		missionControlWarnings || orbiterWarnings || satelliteWarnings || hasUpgradeWarning
	);
	let noNotifications = $derived(!hasNotifications);

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'notifications.alerts'
		},
		{
			id: Symbol('2'),
			labelKey: 'notifications.inbox'
		}
	];

	const store = writable<TabsData>({
		tabId: initTabId(tabs),
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});
</script>

<ButtonIcon {onclick} {level} bind:button>
	{#snippet icon()}
		<IconNotifications size="16px" />
	{/snippet}

	{$i18n.notifications.title}
</ButtonIcon>

<NotificationsCanisterLoader
	canisterId={$missionControlIdDerived}
	bind:cyclesWarning={missionControlCyclesWarning}
	bind:heapWarning={missionControlHeapWarning}
	bind:data={missionControlCanisterData}
/>

<NotificationsCanisterLoader
	canisterId={$orbiterStore?.orbiter_id}
	bind:cyclesWarning={orbiterCyclesWarning}
	bind:heapWarning={orbiterHeapWarning}
	bind:data={orbiterCanisterData}
/>

<NotificationsCanisterLoader
	canisterId={$satelliteStore?.satellite_id}
	bind:cyclesWarning={satelliteCyclesWarning}
	bind:heapWarning={satelliteHeapWarning}
	bind:data={satelliteCanisterData}
/>

<Popover bind:visible anchor={button} direction="rtl" --popover-min-size="340px">
	<div class="container">
		<TabsSegment>
			{#if $store.tabId === $store.tabs[0].id}
				{#if noNotifications}
					{$i18n.notifications.no_alerts}
				{:else}
					{#if hasCanisterNotifications}
						<NotificationsCanister
							href="/mission-control"
							segment="mission_control"
							{close}
							data={missionControlCanisterData}
							heapWarning={missionControlHeapWarning}
							cyclesWarning={missionControlCyclesWarning}
							cyclesIcon={IconMissionControl}
						/>

						<NotificationsCanister
							href="/analytics/?tab=overview"
							segment="orbiter"
							{close}
							data={orbiterCanisterData}
							heapWarning={orbiterHeapWarning}
							cyclesWarning={orbiterCyclesWarning}
							cyclesIcon={IconAnalytics}
						/>

						<NotificationsCanister
							href={overviewLink($satelliteStore?.satellite_id)}
							segment="satellite"
							{close}
							data={satelliteCanisterData}
							heapWarning={satelliteHeapWarning}
							cyclesWarning={satelliteCyclesWarning}
							cyclesIcon={IconSatellite}
						/>
					{/if}

					{#if hasUpgradeWarning}
						<NotificationsUpgrade {close} />
					{/if}
				{/if}
			{:else if $store.tabId === $store.tabs[1].id}
				{$i18n.notifications.no_notifications}
			{/if}
		</TabsSegment>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	.container {
		font-size: var(--font-size-small);
		row-gap: var(--padding);
	}
</style>
