<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	onMount(() =>
		layoutTitle.set({
			title: $i18n.observatory.title,
			icon: IconTelescope
		})
	);
</script>

{@render children?.()}
