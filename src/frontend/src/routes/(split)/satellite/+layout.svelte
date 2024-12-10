<script lang="ts">
	import { nonNullish, debounce } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { Color } from '$lib/types/theme';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => applyColor(Color.LAVENDER_BLUE));

	const debounceSetTitle = debounce(
		() =>
			layoutTitle.set({
				title: nonNullish($satelliteStore)
					? satelliteName($satelliteStore)
					: $i18n.satellites.satellite,
				icon: IconSatellite
			}),
		100
	);

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$satelliteStore, debounceSetTitle();
	});

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$missionControlStore,
			(async () => await loadOrbiters({ missionControl: $missionControlStore }))();
	});
</script>

{@render children()}
