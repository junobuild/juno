<script lang="ts">
	import Layout from '$lib/components/ui/Layout.svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import { onMount } from 'svelte';
	import { layoutTitle } from '$lib/stores/layout.store';

	onMount(() => layoutTitle.set(''));
</script>

<Layout centered={true}>
	<Navbar start="logo" slot="navbar" />

	<slot />

	<Footer slot="footer" themeToggle />
</Layout>
