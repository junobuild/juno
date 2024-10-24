<script lang="ts">
	import { onMount } from 'svelte';
	import { run } from 'svelte/legacy';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() =>
		layoutTitle.set({
			title: $i18n.analytics.title,
			icon: IconAnalytics
		})
	);

	run(() => {
		$missionControlStore,
			(async () => await loadSatellites({ missionControl: $missionControlStore }))();
	});
</script>

{@render children?.()}
