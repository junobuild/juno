<script lang="ts">
	import { fade } from 'svelte/transition';
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { layoutTitle } from '$lib/derived/layout-title.derived';
	import { isSatelliteRoute } from '$lib/derived/route.derived.svelte';
	import SatellitesSwitcher from '$lib/components/satellites/SatellitesSwitcher.svelte';
	import NavbarSatellite from '$lib/components/core/NavbarSatellite.svelte';

	let Icon = $derived($layoutNavigation?.data.icon);
</script>

{#if nonNullish($layoutNavigation) && nonNullish(Icon)}
	<nav in:fade>
		{#if $isSatelliteRoute}
			<NavbarSatellite />
		{:else}
			<Icon size="20px" />

			<span>{$layoutTitle ?? ''}</span>
		{/if}
	</nav>
{/if}

<style lang="scss">
	nav {
		display: inline-flex;
		justify-content: center;
		align-items: center;

		gap: var(--padding-1_5x);
	}
</style>
