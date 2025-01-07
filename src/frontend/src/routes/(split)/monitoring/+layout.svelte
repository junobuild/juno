<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() =>
		layoutNavigation.set({
			title: $i18n.monitoring.title,
			icon: IconTelescope
		})
	);
</script>

{@render children()}
