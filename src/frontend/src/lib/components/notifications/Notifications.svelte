<script lang="ts">
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconNotifications from '$lib/components/icons/IconNotifications.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import NotificationsCanister from '$lib/components/notifications/NotificationsCanister.svelte';
	import NotificationsCanisterLoader from '$lib/components/notifications/NotificationsCanisterLoader.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData } from '$lib/types/canister';
	import { analyticsLink, overviewLink } from '$lib/utils/nav.utils';

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

	let level = $derived<'warning' | 'info' | 'error' | undefined>(
		missionControlWarnings || orbiterWarnings || satelliteWarnings ? 'warning' : undefined
	);

	let hasNotifications = $derived(missionControlWarnings || orbiterWarnings || satelliteWarnings);
	let noNotifications = $derived(!hasNotifications);
</script>

{#if $authSignedIn}
	<ButtonIcon {onclick} {level} bind:button>
		{#snippet icon()}
			<IconNotifications size="16px" />
		{/snippet}

		{$i18n.notifications.title}
	</ButtonIcon>
{/if}

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
		<span class="title">{$i18n.notifications.title}:</span>

		{#if noNotifications}
			{$i18n.notifications.none}
		{:else}
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
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	.title {
		font-weight: var(--font-weight-bold);
	}

	.container {
		font-size: var(--font-size-small);
		row-gap: var(--padding);
	}
</style>
