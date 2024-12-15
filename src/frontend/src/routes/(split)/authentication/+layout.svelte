<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconAuthentication from '$lib/components/icons/IconAuthentication.svelte';
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
			title: $i18n.authentication.title,
			icon: IconAuthentication
		});
		layoutSatellitesSwitcher.set(true);
		applyColor(Color.PAPAYA_WHIP);
	});
</script>

{@render children()}
