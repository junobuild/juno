<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import IconDatastore from '$lib/components/icons/IconDatastore.svelte';
	import { satelliteStore } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => applyColor(Color.AERO_BLUE));

	$effect(() =>
		layoutNavigation.set({
			title: $i18n.datastore.title,
			icon: IconDatastore,
			...(nonNullish($satelliteStore) && {
				satellite: { satellite: $satelliteStore, useInPageTitle: false }
			})
		})
	);
</script>

{@render children()}
