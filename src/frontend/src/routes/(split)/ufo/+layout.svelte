<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import IconUfo from '$lib/components/icons/IconUfo.svelte';
	import { satellite } from '$lib/derived/satellite.derived';
	import { ufo } from '$lib/derived/ufo.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { layoutNavigation } from '$lib/stores/app/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => applyColor(Color.BABY_BLUE));

	$effect(() =>
		layoutNavigation.set({
			title: $i18n.ufo.title,
			icon: IconUfo,
			...(nonNullish($ufo) && {
				ufo: { ufo: $ufo, useInPageTitle: true }
			})
		})
	);
</script>

{@render children()}
