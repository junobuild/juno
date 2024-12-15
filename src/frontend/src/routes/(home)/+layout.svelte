<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { layoutNavigation } from '$lib/stores/layout.navigation.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(layoutNavigation.reset);
</script>

<Layout centered title={false}>
	{#snippet navbar()}
		<Navbar signIn={false} headerOpaqueOnScroll={false} />
	{/snippet}

	{@render children()}

	{#snippet footer()}
		<Footer themeToggle={!$authSignedInStore} end={$authSignedInStore ? 'none' : 'lang'} />
	{/snippet}
</Layout>
