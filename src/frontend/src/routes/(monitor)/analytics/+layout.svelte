<script lang="ts">
	import { onMount } from 'svelte';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';

	onMount(() =>
		layoutTitle.set({
			title: $i18n.analytics.title,
			icon: IconAnalytics
		})
	);

	$: $missionControlStore,
		(async () => await loadSatellites({ missionControl: $missionControlStore }))();
</script>

<slot />
