<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconStorage from '$lib/components/icons/IconStorage.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutSatellitesSwitcher, layoutTitle } from '$lib/stores/layout.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		layoutTitle.set({
			title: $i18n.storage.title,
			icon: IconStorage
		});
		layoutSatellitesSwitcher.set(true);
		applyColor(Color.PINK_LACE);
	});
</script>

{@render children()}
