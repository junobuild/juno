<script lang="ts">
	import { debounce, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import BannerSkylab from '$lib/components/core/BannerSkylab.svelte';
	import Logo from '$lib/components/core/Logo.svelte';
	import NavbarWallet from '$lib/components/core/NavbarWallet.svelte';
	import User from '$lib/components/core/User.svelte';
	import Notifications from '$lib/components/notifications/Notifications.svelte';
	import SatellitesSwitcher from '$lib/components/satellites/SatellitesSwitcher.svelte';
	import ButtonBack from '$lib/components/ui/ButtonBack.svelte';
	import ButtonMenu from '$lib/components/ui/ButtonMenu.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { isSatelliteRoute } from '$lib/derived/route.derived.svelte';
	import { isSkylab } from '$lib/env/app.env';
	import { layoutTitleIntersecting } from '$lib/stores/layout-intersecting.store';

	interface Props {
		start?: 'logo' | 'back' | 'menu';
		signIn?: boolean;
	}

	let { start = 'logo', signIn = true }: Props = $props();

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

		{#if $isSatelliteRoute}
			<div in:fade>
				<SatellitesSwitcher />
			</div>
		{/if}
	</div>

	<div>
		{#if $authSignedIn && nonNullish($missionControlIdDerived)}
			<div in:fade>
				<Notifications />

				<NavbarWallet missionControlId={$missionControlIdDerived} />
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

		gap: var(--padding-1_5x);
	}
</style>
