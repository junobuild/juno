<script lang="ts">
	import { nonNullish, debounce } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { Color } from '$lib/types/theme';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { applyColor } from '$lib/utils/theme.utils';

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

	$: $satelliteStore, debounceSetTitle();

	$: $missionControlStore,
		(async () => await loadOrbiters({ missionControl: $missionControlStore }))();
</script>

<slot />
