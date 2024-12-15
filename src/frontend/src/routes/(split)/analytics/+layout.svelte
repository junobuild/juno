<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout.navigation.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() =>
		layoutNavigation.set({
			title: $i18n.analytics.title,
			icon: IconAnalytics
		})
	);
</script>

{@render children()}
