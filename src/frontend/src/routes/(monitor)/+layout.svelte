<script lang="ts">
	import Layout from '$lib/components/ui/Layout.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';
</script>

<Layout>
	<Navbar start="back" slot="navbar" switcher={false} />

	<slot />

	<Footer slot="footer" themeToggle end={$authSignedInStore ? 'social' : 'lang'} />
</Layout>
