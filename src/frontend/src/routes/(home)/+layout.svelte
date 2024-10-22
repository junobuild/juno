<script lang="ts">
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { layoutTitle } from '$lib/stores/layout.store';

	onMount(() => layoutTitle.set(undefined));
</script>

<Layout centered title={false}>
	<Navbar slot="navbar" signIn={false} headerOpaqueOnScroll={false} />

	<slot />

	<Footer slot="footer" themeToggle end={$authSignedInStore ? 'none' : 'lang'} />
</Layout>
