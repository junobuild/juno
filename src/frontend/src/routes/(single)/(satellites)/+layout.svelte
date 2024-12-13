<script lang="ts">
	import type { Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { loadSatellites } from '$lib/services/satellites.services';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$missionControlStore,
			(async () => await loadSatellites({ missionControl: $missionControlStore }))();
	});
</script>

{@render children()}
