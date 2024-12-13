<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() =>
		layoutTitle.set({
			title: $i18n.wallet.title,
			icon: IconWallet
		})
	);
</script>

{@render children()}
