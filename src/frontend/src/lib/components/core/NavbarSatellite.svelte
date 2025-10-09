<script lang="ts">
	import SatellitesSwitcher from '$lib/components/satellites/SatellitesSwitcher.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import SatelliteEnvironment from '$lib/components/satellites/SatelliteEnvironment.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { layoutTitle } from '$lib/derived/layout-title.derived';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { satelliteStore, satelliteUi } from '$lib/derived/satellite.derived';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { fade } from 'svelte/transition';

	let label = $derived(nonNullish($satelliteStore) ? satelliteName($satelliteStore) : undefined);

	let subNavigation = $derived(
		notEmptyString($layoutTitle) && $layoutNavigation?.data.satellite?.useInPageTitle === false
	);

	let Icon = $derived($layoutNavigation?.data.icon);

	$inspect($layoutNavigation?.data.satellite?.useInPageTitle === false);
</script>

{#snippet currentEnvironment()}
	{#if nonNullish($satelliteUi)}
		<SatelliteEnvironment satellite={$satelliteUi} />
	{/if}
{/snippet}

{#if $authSignedIn && nonNullish(label)}
	<div class="container" in:fade>
		<span class="root">
			<IconSatellite size="20px" />

			<span class="satellite current"><span>{label}</span>{@render currentEnvironment()}</span>
		</span>

		<SatellitesSwitcher />

		{#if subNavigation && nonNullish(Icon)}
			<span class="sub-navigation">
				<span>/</span>
				<Icon size="20px" />
				<span>{$layoutTitle}</span>
			</span>
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';

	.container {
		display: flex;
		align-items: center;
		gap: var(--padding-1_5x);
	}

	.satellite {
		display: inline-flex;
		align-items: center;
		gap: var(--padding);
	}

	.current {
		display: none;

		@include media.min-width(small) {
			display: inline-flex;
		}
	}

	.root,
	.sub-navigation {
		display: none;

		font-size: var(--font-size-small);

		@include media.min-width(small) {
			display: inline-flex;
			align-items: center;
			gap: var(--padding-1_5x);
		}
	}
</style>
