<script lang="ts">
	import { onMount } from 'svelte';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import Layout from '$lib/components/ui/Layout.svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';

	onMount(() => layoutTitle.set($i18n.settings.title));
</script>

<Layout>
	<Navbar start="back" slot="navbar" />

	<slot />

	<Footer slot="footer" themeToggle />
</Layout>
