<script lang="ts">
	import IconNotifications from '$lib/components/icons/IconNotifications.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import Popover from "$lib/components/ui/Popover.svelte";

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const close = () => (visible = false);

	const onclick = () => visible = true;
</script>

{#if $authSignedIn}
	<ButtonIcon {onclick}  bind:button>
		{#snippet icon()}
			<IconNotifications size="16px" />
		{/snippet}
		Notifications
	</ButtonIcon>
{/if}

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		No notifications at the moment.
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;
</style>