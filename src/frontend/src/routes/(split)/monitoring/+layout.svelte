<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		applyColor(Color.HOT_PINK);

		layoutNavigation.set({
			title: $i18n.monitoring.title,
			icon: IconTelescope
		});
	});
</script>

{@render children()}
