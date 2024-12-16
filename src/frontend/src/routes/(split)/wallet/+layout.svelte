<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() =>
		layoutNavigation.set({
			title: $i18n.wallet.title,
			icon: IconWallet
		})
	);
</script>

{@render children()}
