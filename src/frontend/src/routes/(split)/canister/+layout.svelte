<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import IconCanister from '$lib/components/icons/IconCanister.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { layoutNavigation } from '$lib/stores/app/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	// TODO: define color ?
	onMount(() => applyColor(Color.LAVENDER_BLUE));

	$effect(() =>
		layoutNavigation.set({
			title: $i18n.canister.overview,
			icon: IconCanister,
			// TODO: navigation title
			...(nonNullish($satelliteStore) && {
				satellite: { satellite: $satelliteStore, useInPageTitle: true }
			})
		})
	);
</script>

{@render children()}
