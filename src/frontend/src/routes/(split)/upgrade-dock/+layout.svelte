<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconUpgradeDock from '$lib/components/icons/IconUpgradeDock.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		applyColor(Color.ROSE_BONBON);

		layoutNavigation.set({
			title: $i18n.upgrade.title,
			icon: IconUpgradeDock
		});
	});
</script>

{@render children()}
