<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		excludeSegmentId: Principal;
		segmentIdText?: string | undefined;
	}

	let { excludeSegmentId, segmentIdText = $bindable(undefined) }: Props = $props();

	let excludeSegmentIdText: string = $derived(excludeSegmentId.toText());

	let satellites: Satellite[] = $derived(
		$sortedSatellites.filter(({ satellite_id }) => satellite_id.toText() !== excludeSegmentIdText)
	);

	onMount(
		async () =>
			await Promise.all([
				loadOrbiters({ missionControlId: $missionControlIdDerived }),
				loadSatellites({ missionControlId: $missionControlIdDerived })
			])
	);
</script>

<select id="segment" name="segment" bind:value={segmentIdText}>
	{#if isNullish(segmentIdText)}
		<option value={undefined}>{$i18n.canisters.select_destination}</option>
	{/if}

	{#if nonNullish($missionControlIdDerived) && $missionControlIdDerived.toText() !== excludeSegmentIdText}
		<option value={$missionControlIdDerived.toText()}>{$i18n.mission_control.title}</option>
	{/if}

	{#if nonNullish($orbiterStore) && $orbiterStore.orbiter_id.toText() !== excludeSegmentIdText}
		<option value={$orbiterStore.orbiter_id.toText()}>{$i18n.analytics.title}</option>
	{/if}

	{#each satellites as satellite}
		{@const satName = satelliteName(satellite)}

		<option value={satellite.satellite_id.toText()}>{satName}</option>
	{/each}
</select>
