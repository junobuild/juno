<script lang="ts">
	import { onMount } from 'svelte';
	import IconDatastore from '$lib/components/icons/IconDatastore.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		layoutTitle.set({
			title: $i18n.datastore.title,
			icon: IconDatastore
		});
		applyColor(Color.AERO_BLUE);
	});
</script>

{@render children?.()}
