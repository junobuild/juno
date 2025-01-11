<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		applyColor(Color.LAVENDER_BLUE);

		layoutNavigation.set({
			title: $i18n.preferences.title,
			icon: IconRaygun
		});
	});
</script>

{@render children()}
