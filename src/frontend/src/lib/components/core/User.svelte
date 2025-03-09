<script lang="ts">
	import { page } from '$app/state';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
	import IconRocket from '$lib/components/icons/IconRocket.svelte';
	import IconSignIn from '$lib/components/icons/IconSignIn.svelte';
	import IconSignOut from '$lib/components/icons/IconSignOut.svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { satellitesNotLoaded, satellitesStore } from '$lib/derived/satellites.derived';
	import { signIn as doSignIn, signOut } from '$lib/services/auth.services';
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

	let home = $derived(page.route.id === '/(home)');
	let preferences = $derived(page.route.id === '/(single)/preferences');

	// If there is no satellites, we consider the user has a new developer and want to show all links in the user popover that way the user can navigate anyway on the home screen.
	let newDeveloper = $derived($satellitesNotLoaded || ($satellitesStore?.length ?? 0) === 0);
	let showNavigation = $derived(newDeveloper && home);
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
		{#if !home && !preferences}
			<a href="/" class="menu" role="menuitem" aria-haspopup="menu" onclick={close}>
				<IconRocket />
				<span>{$i18n.satellites.launchpad}</span>
			</a>
		{/if}

		{#if showNavigation}
			<a href="/mission-control" class="menu" role="menuitem" aria-haspopup="menu" onclick={close}>
				<IconMissionControl />
				<span>{$i18n.mission_control.title}</span>
			</a>

			<a href="/wallet" class="menu" role="menuitem" aria-haspopup="menu" onclick={close}>
				<IconWallet />
				<span>{$i18n.wallet.title}</span>
			</a>

			<a
				href={analyticsLink($satelliteStore?.satellite_id)}
				class="menu"
				role="menuitem"
				aria-haspopup="menu"
				onclick={close}
			>
				<IconAnalytics />
				<span>{$i18n.analytics.title}</span>
			</a>

			<a href="/monitoring" class="menu" role="menuitem" aria-haspopup="menu" onclick={close}>
				<IconTelescope />
				<span>{$i18n.monitoring.title}</span>
			</a>
		{/if}

		{#if !preferences}
			<a href="/preferences" class="menu" role="menuitem" aria-haspopup="menu" onclick={close}>
				<IconRaygun />
				<span>{$i18n.preferences.title}</span>
			</a>
		{/if}

		<button type="button" role="menuitem" aria-haspopup="menu" onclick={signOutClose} class="menu">
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
