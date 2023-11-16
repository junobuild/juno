<script lang="ts">
	import Layout from '$lib/components/ui/Layout.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
</script>

<Layout>
	<Navbar start="back" slot="navbar" switcher={false} />

	<slot />

	<Footer slot="footer" themeToggle />
</Layout>
