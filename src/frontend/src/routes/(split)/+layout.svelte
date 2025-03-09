<script lang="ts">
	import type { Snippet } from 'svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Navmenu from '$lib/components/core/Navmenu.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<Layout topMargin="wide">
	{#snippet menu()}
		<Navmenu />
	{/snippet}

	{#snippet navbar()}
		<Navbar start="menu" launchpad />
	{/snippet}

	{@render children()}
</Layout>
