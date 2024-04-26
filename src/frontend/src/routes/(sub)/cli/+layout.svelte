<script lang="ts">
	import Layout from '$lib/components/ui/Layout.svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import { onMount } from 'svelte';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';

	onMount(() =>
		layoutTitle.set({
			title: $i18n.cli.title,
			icon: IconUser
		})
	);
</script>

<Layout centered={true}>
	<Navbar start="logo" slot="navbar" />

	<slot />

	<Footer slot="footer" themeToggle end={$authSignedInStore ? 'social' : 'lang'} />
</Layout>
