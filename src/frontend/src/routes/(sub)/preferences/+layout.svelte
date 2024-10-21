<script lang="ts">
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';

	onMount(() =>
		layoutTitle.set({
			title: $i18n.preferences.title,
			icon: IconRaygun
		})
	);
</script>

<Layout>
	<Navbar start="back" slot="navbar" />

	<slot />

	<Footer slot="footer" themeToggle end={$authSignedInStore ? 'social' : 'lang'} />
</Layout>
