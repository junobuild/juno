<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		applyColor(Color.FOLLY_LIGHTER);

		layoutNavigation.set({
			title: $i18n.analytics.title,
			icon: IconAnalytics
		});
	});
</script>

{@render children()}
