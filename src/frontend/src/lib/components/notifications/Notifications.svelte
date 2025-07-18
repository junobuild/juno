<script lang="ts">
	import IconNotifications from '$lib/components/icons/IconNotifications.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import Popover from '$lib/components/ui/Popover.svelte';
	import NotificationsCanisterLoader from '$lib/components/notifications/NotificationsCanisterLoader.svelte';
	import NotificationsMissionControl from '$lib/components/notifications/NotificationsMissionControl.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import type { CanisterData } from '$lib/types/canister';

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const close = () => (visible = false);

	const onclick = () => (visible = true);

	let missionControlCanisterData = $state<CanisterData | undefined>(undefined);
	let missionControlCyclesWarning = $state(false);
	let missionControlHeapWarning = $state(false);

	let level = $derived<'warning' | 'info' | 'error' | undefined>(
		missionControlCyclesWarning || missionControlHeapWarning ? 'warning' : undefined
	);
</script>

{#if $authSignedIn}
	<ButtonIcon {onclick} {level} bind:button>
		{#snippet icon()}
			<IconNotifications size="16px" />
		{/snippet}
		Notifications
	</ButtonIcon>
{/if}

<NotificationsCanisterLoader
	canisterId={$missionControlIdDerived}
	bind:cyclesWarning={missionControlCyclesWarning}
	bind:heapWarning={missionControlHeapWarning}
	bind:data={missionControlCanisterData}
/>

<Popover bind:visible anchor={button} direction="rtl" --popover-min-size="340px">
	<div class="container">
		No notifications at the moment.

		<NotificationsMissionControl
			{close}
			data={missionControlCanisterData}
			heapWarning={missionControlHeapWarning}
			cyclesWarning={missionControlCyclesWarning}
		/>
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
