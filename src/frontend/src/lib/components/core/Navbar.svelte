<script lang="ts">
	import { debounce, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import BannerSkylab from '$lib/components/core/BannerSkylab.svelte';
	import Logo from '$lib/components/core/Logo.svelte';
	import NavbarCockpit from '$lib/components/core/NavbarCockpit.svelte';
	import User from '$lib/components/core/User.svelte';
	import SatellitesSwitcher from '$lib/components/satellites/SatellitesSwitcher.svelte';
	import ButtonBack from '$lib/components/ui/ButtonBack.svelte';
	import ButtonMenu from '$lib/components/ui/ButtonMenu.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import { isSkylab } from '$lib/env/app.env';
	import { layoutTitleIntersecting } from '$lib/stores/layout-intersecting.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';

	interface Props {
		start?: 'logo' | 'back' | 'menu';
		signIn?: boolean;
		launchpad?: boolean;
	}

	let { start = 'logo', signIn = true, launchpad = false }: Props = $props();

	let hide = $state(false);

	// We debounce hiding the header to avoid the effect on navigation
	const hideHeader = () => (hide = !$layoutTitleIntersecting);
	const debounceHideHeader = debounce(hideHeader);

	$effect(() => {
		$layoutTitleIntersecting;

		debounceHideHeader();
	});
</script>

{#snippet banner()}
	<BannerSkylab />
{/snippet}

<Header {hide} banner={isSkylab() ? banner : undefined}>
	<div class="start">
		{#if start === 'menu'}
			<ButtonMenu />
		{:else if start === 'back'}
			<ButtonBack />
		{:else}
			<Logo />
		{/if}

		{#if nonNullish($layoutNavigation?.data.satellite)}
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
