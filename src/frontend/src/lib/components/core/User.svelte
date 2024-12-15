<script lang="ts">
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
	import IconSignIn from '$lib/components/icons/IconSignIn.svelte';
	import IconSignOut from '$lib/components/icons/IconSignOut.svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Theme from '$lib/components/ui/Theme.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { signIn as doSignIn, signOut } from '$lib/services/auth.services';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { analyticsLink } from '$lib/utils/nav.utils';

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

{#if $authSignedInStore}
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
