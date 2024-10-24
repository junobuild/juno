<script lang="ts">
	import { nonNullish, debounce } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { Color } from '$lib/types/theme';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children?: Snippet;
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
		$satelliteStore, debounceSetTitle();
	});

	run(() => {
		$missionControlStore,
			(async () => await loadOrbiters({ missionControl: $missionControlStore }))();
	});
</script>

{@render children?.()}
