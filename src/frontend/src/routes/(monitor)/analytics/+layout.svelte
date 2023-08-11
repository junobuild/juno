<script lang="ts">
	import { onMount } from 'svelte';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { missionControlStore } from '$lib/stores/mission-control.store';

	onMount(() => layoutTitle.set($i18n.analytics.title));

	$: $missionControlStore,
		(async () => await loadOrbiters({ missionControl: $missionControlStore }))();
</script>

<slot />
