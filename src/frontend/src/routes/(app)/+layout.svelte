<script lang="ts">
	import Layout from '$lib/components/ui/Layout.svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import Navmenu from '$lib/components/core/Navmenu.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { loadSatellites } from '$lib/services/satellites.services';
	import Footer from '$lib/components/ui/Footer.svelte';

	$: $missionControlStore,
		(async () => await loadSatellites({ missionControl: $missionControlStore }))();
</script>

<Layout topMargin="wide">
	<Navmenu slot="menu" />

	<Navbar start="menu" slot="navbar" launchpad />

	<slot />

	<Footer slot="footer" end="social" />
</Layout>
