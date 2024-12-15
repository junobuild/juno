<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutSatellitesSwitcher, layoutTitle } from '$lib/stores/layout.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		layoutTitle.set({
			title: $i18n.preferences.title,
			icon: IconRaygun
		});

		layoutSatellitesSwitcher.set(false);
	});
</script>

{@render children()}
