<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => applyColor(Color.LAVENDER_BLUE));

	$effect(() =>
		layoutNavigation.set({
			title: $i18n.satellites.overview,
			icon: IconSatellite,
			...(nonNullish($satelliteStore) && {
				satellite: { satellite: $satelliteStore, useInPageTitle: true }
			})
		})
	);

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$missionControlStore,
			(async () => await loadOrbiters({ missionControl: $missionControlStore }))();
	});
</script>

{@render children()}
