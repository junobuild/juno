<script lang="ts">
	import { onMount } from 'svelte';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { loadSatellites } from '$lib/services/satellites.services';

	onMount(() => layoutTitle.set($i18n.analytics.title));

	$: $missionControlStore,
		(async () => await loadSatellites({ missionControl: $missionControlStore }))();
</script>

<slot />
