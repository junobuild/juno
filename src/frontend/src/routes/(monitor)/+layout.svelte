<script lang="ts">
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Layout>
	{#snippet navbar()}
		<Navbar start="back" />
	{/snippet}

	{@render children?.()}

	{#snippet footer()}
		<Footer themeToggle end={$authSignedInStore ? 'social' : 'lang'} />
	{/snippet}
</Layout>
