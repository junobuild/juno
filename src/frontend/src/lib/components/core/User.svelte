<script lang="ts">
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
	import IconSignIn from '$lib/components/icons/IconSignIn.svelte';
	import IconSignOut from '$lib/components/icons/IconSignOut.svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { signIn as doSignIn, signOut } from '$lib/services/auth.services';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
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
</script>

{#if $authSignedInStore}
	<ButtonIcon onclick={() => (visible = true)} bind:button>
		{#snippet icon()}
			<IconUser />
		{/snippet}
		{$i18n.core.user_menu}
	</ButtonIcon>
{:else if signIn}
	<ButtonIcon onclick={async () => await doSignIn({})}>
		{#snippet icon()}
			<IconSignIn />
		{/snippet}
		{$i18n.core.sign_in}
	</ButtonIcon>
{/if}

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<a href="/mission-control" class="menu" role="menuitem" aria-haspopup="menu" onclick={close}>
			<IconMissionControl />
			<span>{$i18n.mission_control.title}</span>
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
			<span>{$i18n.observatory.title}</span>
		</a>

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
