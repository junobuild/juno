<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import IconAuthentication from '$lib/components/icons/IconAuthentication.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';
	import { satelliteStore } from '$lib/derived/satellite.derived';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => applyColor(Color.PAPAYA_WHIP));

	$effect(() =>
		layoutNavigation.set({
			title: $i18n.authentication.title,
			icon: IconAuthentication,
			...(nonNullish($satelliteStore) && {
				satellite: { satellite: $satelliteStore, useInPageTitle: false }
			})
		})
	);
</script>

{@render children()}
