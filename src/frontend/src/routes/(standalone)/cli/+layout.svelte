<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() =>
		layoutNavigation.set({
			title: $i18n.cli.title,
			icon: IconUser
		})
	);
</script>

<Layout centered={true}>
	{#snippet navbar()}
		<Navbar start="logo" />
	{/snippet}

	{@render children()}

	{#snippet footer()}
		<Footer themeToggle end={$authSignedInStore ? 'none' : 'lang'} />
	{/snippet}
</Layout>
