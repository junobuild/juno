<script lang="ts">
	import { setContext, untrack } from 'svelte';
	import { writable } from 'svelte/store';
	import IconNotifications from '$lib/components/icons/IconNotifications.svelte';
	import NotificationsAlerts from '$lib/components/notifications/NotificationsAlerts.svelte';
	import NotificationsAlertsLoader from '$lib/components/notifications/NotificationsAlertsLoader.svelte';
	import NotificationsCanisterLoader from '$lib/components/notifications/NotificationsCanisterLoader.svelte';
	import NotificationsInbox from '$lib/components/notifications/NotificationsInbox.svelte';
	import NotificationsInboxLoader from '$lib/components/notifications/NotificationsInboxLoader.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import TabsSegment from '$lib/components/ui/TabsSegment.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterWarning } from '$lib/types/canister';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsData
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const close = () => (visible = false);

	const onclick = () => (visible = true);

	let missionControlCanisterData = $state<CanisterData | undefined>(undefined);
	let missionControlWarnings = $state<CanisterWarning | undefined>(undefined);

	let orbiterCanisterData = $state<CanisterData | undefined>(undefined);
	let orbiterWarnings = $state<CanisterWarning | undefined>(undefined);

	let satelliteCanisterData = $state<CanisterData | undefined>(undefined);
	let satelliteWarnings = $state<CanisterWarning | undefined>(undefined);

	let upgradeWarning = $state(false);
	let canisterWarnings = $state(false);
	let canisterNotifications = $state(false);

	let hasAlerts = $state(false);
	let hasNotifications = $derived(canisterNotifications);

	let level = $derived<'warning' | 'success' | 'error' | undefined>(
		hasAlerts ? 'warning' : hasNotifications ? 'success' : undefined
	);

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
		tabId: tabs[0].id,
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});

	const initTab = () => {
		if (visible) {
			return;
		}

		store.update((data) => ({ ...data, tabId: tabs[level === 'success' ? 1 : 0].id }));
	};

	$effect(() => {
		level;

		untrack(() => {
			initTab();
		});
	});
</script>

<ButtonIcon {onclick} {level} bind:button>
	{#snippet icon()}
		<IconNotifications size="16px" />
	{/snippet}

	{$i18n.notifications.title}
</ButtonIcon>

<NotificationsAlertsLoader
	{missionControlCanisterData}
	{missionControlWarnings}
	{orbiterCanisterData}
	{orbiterWarnings}
	{satelliteCanisterData}
	{satelliteWarnings}
	bind:alerts={hasAlerts}
	bind:upgradeWarning
	bind:canisterWarnings
/>

<NotificationsInboxLoader {missionControlCanisterData} bind:canisterNotifications />

<Popover bind:visible anchor={button} direction="rtl" --popover-min-size="340px">
	<div class="container">
		<TabsSegment>
			{#if $store.tabId === $store.tabs[0].id}
				<NotificationsAlerts
					{missionControlCanisterData}
					{missionControlWarnings}
					{orbiterCanisterData}
					{orbiterWarnings}
					{satelliteCanisterData}
					{satelliteWarnings}
					alerts={hasAlerts}
					{upgradeWarning}
					{canisterWarnings}
					{close}
				/>
			{:else if $store.tabId === $store.tabs[1].id}
				<NotificationsInbox {close} {canisterNotifications} />
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
