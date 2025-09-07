<script lang="ts">
	import { page } from '$app/state';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconBook from '$lib/components/icons/IconBook.svelte';
	import IconCodeBranch from '$lib/components/icons/IconCodeBranch.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
	import IconRocket from '$lib/components/icons/IconRocket.svelte';
	import IconSignIn from '$lib/components/icons/IconSignIn.svelte';
	import IconSignOut from '$lib/components/icons/IconSignOut.svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import IconUpgradeDock from '$lib/components/icons/IconUpgradeDock.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { APP_VERSION } from '$lib/constants/app.constants';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { satellitesNotLoaded, satellitesStore } from '$lib/derived/satellites.derived';
	import { signIn as doSignIn, signOut } from '$lib/services/auth/auth.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { analyticsLink, upgradeDockLink } from '$lib/utils/nav.utils';

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

	let home = $derived(page.route.id === '/(home)');
	let preferences = $derived(page.route.id === '/(single)/preferences');

	// If there is no satellites, we consider the user has a new developer and want to show all links in the user popover that way the user can navigate anyway on the home screen.
	let newDeveloper = $derived($satellitesNotLoaded || ($satellitesStore?.length ?? 0) === 0);
	let showNavigation = $derived(newDeveloper && home);
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
		{#if !home && !preferences}
			<a class="menu" aria-haspopup="menu" href="/" onclick={close} role="menuitem">
				<IconRocket />
				<span>{$i18n.satellites.launchpad}</span>
			</a>
		{/if}

		{#if showNavigation}
			<a class="menu" aria-haspopup="menu" href="/mission-control" onclick={close} role="menuitem">
				<IconMissionControl />
				<span>{$i18n.mission_control.title}</span>
			</a>

			<a class="menu" aria-haspopup="menu" href="/wallet" onclick={close} role="menuitem">
				<IconWallet />
				<span>{$i18n.wallet.title}</span>
			</a>

			<a
				class="menu"
				aria-haspopup="menu"
				href={analyticsLink($satelliteStore?.satellite_id)}
				onclick={close}
				role="menuitem"
			>
				<IconAnalytics />
				<span>{$i18n.analytics.title}</span>
			</a>

			<a class="menu" aria-haspopup="menu" href="/monitoring" onclick={close} role="menuitem">
				<IconTelescope />
				<span>{$i18n.monitoring.title}</span>
			</a>

			<a
				class="menu"
				aria-haspopup="menu"
				href={upgradeDockLink($satelliteStore?.satellite_id)}
				onclick={close}
				role="menuitem"
			>
				<IconUpgradeDock />
				<span>{$i18n.upgrade.title}</span>
			</a>

			{#if preferences}
				<hr />
			{/if}
		{/if}

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
