<script lang="ts">
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
	import IconSignIn from '$lib/components/icons/IconSignIn.svelte';
	import IconSignOut from '$lib/components/icons/IconSignOut.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { signIn as doSignIn, signOut } from '$lib/services/auth.services';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		signIn?: boolean;
	}

	let { signIn = true }: Props = $props();

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const signOutClose = async () => {
		close();
		await signOut();
	};

	const close = () => (visible = false);

	const onLogin = async () => {
		await doSignIn({});
	};

	// eslint-disable-next-line require-await
	const onclick = async () => {
		visible = true;
	};
</script>

{#if $authSignedIn}
	<ButtonIcon {onclick} bind:button>
		{#snippet icon()}
			<IconUser />
		{/snippet}
		{$i18n.core.user_menu}
	</ButtonIcon>
{:else if signIn}
	<ButtonIcon onclick={onLogin}>
		{#snippet icon()}
			<IconSignIn />
		{/snippet}
		{$i18n.core.sign_in}
	</ButtonIcon>
{/if}

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<a href="/preferences" class="menu" role="menuitem" aria-haspopup="menu" onclick={close}>
			<IconRaygun />
			<span>{$i18n.preferences.title}</span>
		</a>

		<button type="button" role="menuitem" aria-haspopup="menu" onclick={signOutClose} class="menu">
			<IconSignOut />
			<span>{$i18n.core.sign_out}</span>
		</button>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;
</style>
