<script lang="ts">
	import Layout from '$lib/components/ui/Layout.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Navbar from '$lib/components/core/Navbar.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { loadSatellites } from '$lib/services/satellites.services';

	$: $missionControlStore,
		(async () => await loadSatellites({ missionControl: $missionControlStore }))();
</script>

<Layout>
	<Navbar start="back" slot="navbar" switcher={false} />

	<slot />

	<Footer slot="footer" themeToggle />
</Layout>
