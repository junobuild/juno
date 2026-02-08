<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import { page } from '$app/state';
	import UserProviderData from '$lib/components/core/UserProviderData.svelte';
	import IconBook from '$lib/components/icons/IconBook.svelte';
	import IconCodeBranch from '$lib/components/icons/IconCodeBranch.svelte';
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
	import IconSignOut from '$lib/components/icons/IconSignOut.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Hr from '$lib/components/ui/Hr.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { APP_VERSION } from '$lib/constants/app.constants';
	import { signOut } from '$lib/services/console/auth/auth.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { ProviderDataUi } from '$lib/types/provider';

	interface Props {
		providerData?: ProviderDataUi;
	}

	let { providerData }: Props = $props();

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const signOutClose = async () => {
		close();
		await signOut();
	};

	const close = () => (visible = false);

	// eslint-disable-next-line require-await
	const onclick = async () => {
		visible = true;
	};

	let preferences = $derived(page.route.id === '/(single)/preferences');
	let wallet = $derived(page.route.id === '/(single)/wallet');

	let openIdPicture = $derived(providerData?.picture);
</script>

<ButtonIcon {onclick} bind:button>
	{#snippet icon()}
		{#if notEmptyString(openIdPicture)}
			<Avatar alt="" src={openIdPicture} />
		{:else}
			<IconUser size="14px" />
		{/if}
	{/snippet}

	{$i18n.core.user_menu}
</ButtonIcon>

<Popover anchor={button} direction="rtl" bind:visible>
	<div class="container">
		<UserProviderData {providerData} />

		{#if !preferences}
			<a class="menu" aria-haspopup="menu" href="/preferences" onclick={close} role="menuitem">
				<IconRaygun />
				<span>{$i18n.preferences.title}</span>
			</a>
		{/if}

		{#if !wallet}
			<a class="menu" aria-haspopup="menu" href="/wallet" onclick={close} role="menuitem">
				<IconWallet />
				<span>{$i18n.wallet.title}</span>
			</a>
		{/if}

		{#if !preferences || !wallet}
			<Hr />
		{/if}

		<a
			class="menu"
			aria-haspopup="menu"
			href="https://juno.build/docs/intro"
			onclick={close}
			rel="external noopener noreferrer"
			role="menuitem"
			target="_blank"><IconBook /> <span>Docs</span></a
		>

		<a
			class="menu"
			aria-haspopup="menu"
			href={`https://juno.build/changelog/release-v${APP_VERSION}`}
			onclick={close}
			rel="external noopener noreferrer"
			role="menuitem"
			target="_blank"><IconCodeBranch /> <span>Changelog</span></a
		>

		<Hr />

		<button class="menu" aria-haspopup="menu" onclick={signOutClose} role="menuitem" type="button">
			<IconSignOut />
			<span>{$i18n.core.sign_out}</span>
		</button>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	.container {
		font-size: var(--font-size-small);
	}
</style>
