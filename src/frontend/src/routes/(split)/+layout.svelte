<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Navmenu from '$lib/components/core/Navmenu.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let routeId: string | null = $derived(page.route.id);
	let fullWidth = $derived(routeId?.includes('functions'));
</script>

<Layout {fullWidth}>
	{#snippet menu()}
		<Navmenu />
	{/snippet}

	{#snippet navbar()}
		<Navbar start="menu" />
	{/snippet}

	{@render children()}
</Layout>
