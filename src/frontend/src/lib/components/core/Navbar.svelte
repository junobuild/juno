<script lang="ts">
	import { fade } from 'svelte/transition';
	import Logo from '$lib/components/core/Logo.svelte';
	import NavbarCockpit from '$lib/components/core/NavbarCockpit.svelte';
	import User from '$lib/components/core/User.svelte';
	import SatellitesSwitcher from '$lib/components/satellites/SatellitesSwitcher.svelte';
	import ButtonBack from '$lib/components/ui/ButtonBack.svelte';
	import ButtonMenu from '$lib/components/ui/ButtonMenu.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import { layoutTitleIntersecting } from '$lib/stores/layout.intersecting.store';
	import { layoutSatellitesSwitcher } from '$lib/stores/layout.store';

	interface Props {
		start?: 'logo' | 'back' | 'menu';
		signIn?: boolean;
		launchpad?: boolean;
		headerOpaqueOnScroll?: boolean;
	}

	let {
		start = 'logo',
		signIn = true,
		launchpad = false,
		headerOpaqueOnScroll = true
	}: Props = $props();
</script>

<Header opaque={!$layoutTitleIntersecting && headerOpaqueOnScroll}>
	<div class="start">
		{#if start === 'menu'}
			<ButtonMenu />
		{:else if start === 'back'}
			<ButtonBack />
		{:else}
			<Logo />
		{/if}

		{#if $layoutSatellitesSwitcher}
			<div in:fade>
				<SatellitesSwitcher />
			</div>
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

	.end {
		gap: var(--padding-6x);
	}
</style>
