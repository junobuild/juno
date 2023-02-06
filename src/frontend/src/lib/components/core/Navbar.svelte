<script lang="ts">
	import Header from '$lib/components/ui/Header.svelte';
	import { layoutTitle, layoutTitleIntersecting } from '$lib/stores/layout.store';
	import ButtonMenu from '$lib/components/ui/ButtonMenu.svelte';
	import User from '$lib/components/core/User.svelte';
	import ButtonBack from '$lib/components/ui/ButtonBack.svelte';
	import SatellitesSwitcher from '$lib/components/satellites/SatellitesSwitcher.svelte';
	import Logo from '$lib/components/presentation/Logo.svelte';

	export let start: 'logo' | 'back' | 'menu' = 'logo';
	export let signIn = true;
	export let headerOpaqueOnScroll = true;
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

		<h1>{$layoutTitle}</h1>
	</div>

	<div class="end">
		<SatellitesSwitcher />

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

	h1 {
		margin: 0;
		line-height: var(--line-height-standard);

		display: none;

		@include media.min-width(medium) {
			display: inline-block;
		}
	}

	.end {
		@include media.min-width(xlarge) {
			padding: 0 0 var(--padding-4x);
		}
	}
</style>
