<script lang="ts">
	import App404 from '$lib/components/app/core/App404.svelte';
	import Navbar from '$lib/components/app/core/Navbar.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
</script>

<Layout centered>
	{#snippet navbar()}
		<Navbar />
	{/snippet}

	<App404 />

	{#snippet footer()}
		<Footer />
	{/snippet}
</Layout>
