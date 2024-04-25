<script lang="ts">
	import Layout from '$lib/components/ui/Layout.svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import { onMount } from 'svelte';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import Footer from '$lib/components/ui/Footer.svelte';

	onMount(() => layoutTitle.set(''));
</script>

<Layout centered title={false}>
	<Navbar
		slot="navbar"
		signIn={false}
		headerOpaqueOnScroll={false}
		resources={!$authSignedInStore}
	/>

	<slot />

	<Footer slot="footer" themeToggle social={!$authSignedInStore} />
</Layout>
