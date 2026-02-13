<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import IconRocket from '$lib/components/icons/IconRocket.svelte';
    import { satellite } from '$lib/derived/satellite.derived';
    import { i18n } from '$lib/stores/app/i18n.store';
    import { layoutNavigation } from '$lib/stores/app/layout-navigation.store';
    import { Color } from '$lib/types/theme';
    import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => applyColor(Color.KEPPEL));

	$effect(() =>
		layoutNavigation.set({
			title: $i18n.deployments.title,
			icon: IconRocket,
			...(nonNullish($satellite) && {
				satellite: { satellite: $satellite, useInPageTitle: false }
			})
		})
	);
</script>

{@render children()}
