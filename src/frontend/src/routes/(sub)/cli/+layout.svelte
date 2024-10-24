<script lang="ts">
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() =>
		layoutTitle.set({
			title: $i18n.cli.title,
			icon: IconUser
		})
	);
</script>

<Layout centered={true}>
	{#snippet navbar()}
		<Navbar start="logo" />
	{/snippet}

	{@render children?.()}

	{#snippet footer()}
		<Footer themeToggle end={$authSignedInStore ? 'social' : 'lang'} />
	{/snippet}
</Layout>
