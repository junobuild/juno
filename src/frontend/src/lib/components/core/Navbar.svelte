<script lang="ts">
	import Header from '$lib/components/ui/Header.svelte';
	import { layoutTitleIntersecting } from '$lib/stores/layout.store';
	import ButtonMenu from '$lib/components/ui/ButtonMenu.svelte';
	import User from '$lib/components/core/User.svelte';
	import ButtonBack from '$lib/components/ui/ButtonBack.svelte';
	import SatellitesSwitcher from '$lib/components/satellites/SatellitesSwitcher.svelte';
	import Logo from '$lib/components/presentation/Logo.svelte';
	import Resources from '$lib/components/examples/Resources.svelte';

	export let start: 'logo' | 'back' | 'menu' = 'logo';
	export let signIn = true;
	export let resources = false;
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

		{#if resources}
			<Resources />
		{/if}

		<SatellitesSwitcher />
	</div>

	<div class="end">
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
</style>
