<script lang="ts">
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import NavbarSatellite from '$lib/components/core/NavbarSatellite.svelte';
	import SatellitesSwitcher from '$lib/components/satellites/SatellitesSwitcher.svelte';
	import { layoutTitle } from '$lib/derived/layout-title.derived';
	import { isSatelliteRoute } from '$lib/derived/route.derived.svelte';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';

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

		font-size: var(--font-size-small);
	}
</style>
