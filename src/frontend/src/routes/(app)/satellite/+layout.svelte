<script lang="ts">
	import { onMount } from 'svelte';
	import { applyColor } from '$lib/utils/theme.utils';
	import { Color } from '$lib/types/theme';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { nonNullish } from '@dfinity/utils';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { debounce } from '@dfinity/utils';

	onMount(() => applyColor(Color.LAVENDER_BLUE));

	const debounceSetTitle = debounce(
		() =>
			layoutTitle.set(
				nonNullish($satelliteStore) ? satelliteName($satelliteStore) : $i18n.satellites.satellite
			),
		100
	);

	$: $satelliteStore, debounceSetTitle();
</script>

<slot />
