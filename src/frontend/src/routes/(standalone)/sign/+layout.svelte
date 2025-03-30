<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';
	import IconWallet from "$lib/components/icons/IconWallet.svelte";

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		applyColor(Color.TIFFANY_BLUE);

		layoutNavigation.set({
			title: $i18n.signer.title,
			icon: IconWallet
		});
	});
</script>

<Layout centered={true}>
	{#snippet navbar()}
		<Navbar start="logo" signIn={false} />
	{/snippet}

	{@render children()}

	{#snippet footer()}
		<Footer />
	{/snippet}
</Layout>
