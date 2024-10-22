<script lang="ts">
	import Logo from '$lib/components/core/Logo.svelte';
	import NavbarCockpit from '$lib/components/core/NavbarCockpit.svelte';
	import User from '$lib/components/core/User.svelte';
	import SatellitesSwitcher from '$lib/components/satellites/SatellitesSwitcher.svelte';
	import ButtonBack from '$lib/components/ui/ButtonBack.svelte';
	import ButtonMenu from '$lib/components/ui/ButtonMenu.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import { layoutTitleIntersecting } from '$lib/stores/layout.store';

	export let start: 'logo' | 'back' | 'menu' = 'logo';
	export let signIn = true;
	export let launchpad = false;
	export let headerOpaqueOnScroll = true;
</script>

<Header opaque={!$layoutTitleIntersecting && headerOpaqueOnScroll}>
	<div class="start">
		{#if start === 'menu'}
			<ButtonMenu />
		{:else if start === 'back'}
			<ButtonBack />
		{:else}
			<div class="logo">
				<Logo />
			</div>
		{/if}

		{#if launchpad}
			<SatellitesSwitcher />
		{/if}
	</div>

	<div class="end">
		{#if launchpad}
			<div>
				<NavbarCockpit />
			</div>
		{/if}

		<User {signIn} />
	</div>
</Header>

<style lang="scss">
	@use '../../../lib/styles/mixins/media';

	div {
		display: flex;
		justify-content: center;
		align-items: center;

		gap: var(--padding);
	}

	.logo {
		margin: 0 var(--padding-4x) 0 0;
	}

	.end {
		gap: var(--padding-6x);
	}
</style>
