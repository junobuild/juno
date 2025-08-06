<script lang="ts">
	import App404 from '$lib/components/core/App404.svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
</script>

<Layout centered title={false}>
	{#snippet navbar()}
		<Navbar signIn={false} />
	{/snippet}

	<App404 />

	{#snippet footer()}
		<Footer />
	{/snippet}
</Layout>
