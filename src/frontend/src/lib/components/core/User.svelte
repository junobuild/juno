<script lang="ts">
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { signIn as doSignIn, signOut } from '$lib/services/auth.services';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import IconSignOut from '$lib/components/icons/IconSignOut.svelte';
	import IconSignIn from '$lib/components/icons/IconSignIn.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';

	export let signIn = true;

	let button: HTMLButtonElement | undefined;
	let visible: boolean | undefined;

	const signOutClose = async () => {
		visible = false;
		await signOut();
	};
</script>

{#if $authSignedInStore}
	<ButtonIcon on:click={() => (visible = true)} bind:button>
		<IconUser slot="icon" />
		{$i18n.core.user_menu}
	</ButtonIcon>
{:else if signIn}
	<ButtonIcon on:click={async () => await doSignIn({})}>
		<IconSignIn slot="icon" />
		{$i18n.core.sign_in}
	</ButtonIcon>
{/if}

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<a
			href="/mission-control"
			class="menu"
			role="menuitem"
			aria-haspopup="menu"
			rel="external noopener norefferer"
		>
			<IconMissionControl />
			<span>{$i18n.mission_control.title}</span>
		</a>

		<a
			href="/observatory"
			class="menu"
			role="menuitem"
			aria-haspopup="menu"
			rel="external noopener norefferer"
		>
			<IconTelescope />
			<span>{$i18n.observatory.title}</span>
		</a>

		<a
			href="/analytics"
			class="menu"
			role="menuitem"
			aria-haspopup="menu"
			rel="external noopener norefferer"
		>
			<IconTelescope />
			<span>{$i18n.analytics.title}</span>
		</a>

		<a
			href="/settings"
			class="menu"
			role="menuitem"
			aria-haspopup="menu"
			rel="external noopener norefferer"
		>
			<IconRaygun />
			<span>{$i18n.settings.title}</span>
		</a>

		<button type="button" role="menuitem" aria-haspopup="menu" on:click={signOutClose} class="menu">
			<IconSignOut />
			<span>{$i18n.core.sign_out}</span>
		</button>
	</div>
</Popover>

<style lang="scss">
	.container {
		padding: var(--padding);
	}
</style>
