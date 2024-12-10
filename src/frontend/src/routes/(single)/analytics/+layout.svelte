<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';


	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() =>
		layoutTitle.set({
			title: $i18n.analytics.title,
			icon: IconAnalytics
		})
	);

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$missionControlStore,
			(async () => await loadSatellites({ missionControl: $missionControlStore }))();
	});
</script>

{@render children()}
