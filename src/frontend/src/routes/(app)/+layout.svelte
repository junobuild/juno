<script lang="ts">
	import { run } from 'svelte/legacy';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Navmenu from '$lib/components/core/Navmenu.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	run(() => {
		$missionControlStore,
			(async () => await loadSatellites({ missionControl: $missionControlStore }))();
	});
</script>

<Layout topMargin="wide">
	{#snippet menu()}
		<Navmenu />
	{/snippet}

	{#snippet navbar()}
		<Navbar start="menu" launchpad />
	{/snippet}

	{@render children?.()}

	{#snippet footer()}
		<Footer end="social" />
	{/snippet}
</Layout>
