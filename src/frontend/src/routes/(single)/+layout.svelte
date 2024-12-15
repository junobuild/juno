<script lang="ts">
	import type { Snippet } from 'svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<Layout>
	{#snippet navbar()}
		<Navbar start="back" />
	{/snippet}

	{@render children()}

	{#snippet footer()}
		<Footer />
	{/snippet}
</Layout>
