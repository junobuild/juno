<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import IconHosting from '$lib/components/icons/IconHosting.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';
	import { satelliteStore } from '$lib/derived/satellite.derived';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => applyColor(Color.BABY_PINK));

	$effect(() =>
		layoutNavigation.set({
			title: $i18n.hosting.title,
			icon: IconHosting,
			...(nonNullish($satelliteStore) && {
				satellite: { satellite: $satelliteStore, useInPageTitle: false }
			})
		})
	);
</script>

{@render children()}
