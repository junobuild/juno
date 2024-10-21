<script lang="ts">
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Navmenu from '$lib/components/core/Navmenu.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Layout from '$lib/components/ui/Layout.svelte';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { missionControlStore } from '$lib/stores/mission-control.store';

	$: $missionControlStore,
		(async () => await loadSatellites({ missionControl: $missionControlStore }))();
</script>

<Layout topMargin="wide">
	<Navmenu slot="menu" />

	<Navbar start="menu" slot="navbar" launchpad />

	<slot />

	<Footer slot="footer" end="social" />
</Layout>
