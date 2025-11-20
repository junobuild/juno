<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		applyColor(Color.LAVENDER_BLUE);

		layoutNavigation.reset();
	});
</script>

{@render children()}
