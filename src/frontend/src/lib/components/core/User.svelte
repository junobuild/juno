<script lang="ts">
	import { page } from '$app/state';
	import IconBook from '$lib/components/icons/IconBook.svelte';
	import IconCodeBranch from '$lib/components/icons/IconCodeBranch.svelte';
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
	import IconSignIn from '$lib/components/icons/IconSignIn.svelte';
	import IconSignOut from '$lib/components/icons/IconSignOut.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { APP_VERSION } from '$lib/constants/app.constants';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { signIn as doSignIn, signOut } from '$lib/services/auth/auth.services';
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

	let preferences = $derived(page.route.id === '/(single)/preferences');
</script>

{#if $authSignedIn}
	<ButtonIcon {onclick} bind:button>
		{#snippet icon()}
			<IconUser size="14px" />
		{/snippet}
		{$i18n.core.user_menu}
	</ButtonIcon>
{:else if signIn}
	<ButtonIcon onclick={onLogin}>
		{#snippet icon()}
			<IconSignIn size="14px" />
		{/snippet}
		{$i18n.core.sign_in}
	</ButtonIcon>
{/if}

<Popover anchor={button} direction="rtl" bind:visible>
	<div class="container">
		{#if !preferences}
			<a class="menu" aria-haspopup="menu" href="/preferences" onclick={close} role="menuitem">
				<IconRaygun />
				<span>{$i18n.preferences.title}</span>
			</a>

			<hr />
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

		<hr />

		<button class="menu" aria-haspopup="menu" onclick={signOutClose} role="menuitem" type="button">
			<IconSignOut />
			<span>{$i18n.core.sign_out}</span>
		</button>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';
	@use '../../styles/mixins/media';

	@include overlay.popover-container;

	.container {
		font-size: var(--font-size-small);
	}

	hr {
		width: calc(100% - var(--padding-2x));
		height: auto;

		margin: var(--padding-0_5x) auto;
		padding: 0;

		border-bottom: 1px solid var(--color-background-shade);

		&::before {
			content: none;
		}
	}

	@include media.dark-theme {
		hr {
			border-color: var(--color-menu-tint);
		}
	}
</style>
