<script lang="ts">
	import { satellitesStore } from '$lib/stores/satellite.store';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { orbiterStore } from '$lib/stores/orbiter.store';

	export let excludeSegmentId: Principal;
	export let segmentIdText: string | undefined = undefined;

	let excludeSegmentIdText: string;
	$: excludeSegmentIdText = excludeSegmentId.toText();

	let satellites: Satellite[];
	$: satellites = ($satellitesStore ?? []).filter(
		({ satellite_id }) => satellite_id.toText() !== excludeSegmentIdText
	);
</script>

<select id="segment" name="segment" bind:value={segmentIdText}>
	{#if isNullish(segmentIdText)}
		<option value={undefined}>{$i18n.analytics.all_satellites}</option>
	{/if}

	{#if nonNullish($missionControlStore) && $missionControlStore.toText() !== excludeSegmentIdText}
		<option value={$missionControlStore.toText()}>{$i18n.mission_control.title}</option>
	{/if}

	{#if nonNullish($orbiterStore) && $orbiterStore.orbiter_id.toText() !== excludeSegmentIdText}
		<option value={$orbiterStore.orbiter_id.toText()}>{$i18n.analytics.title}</option>
	{/if}

	{#each satellites as satellite}
		{@const satName = satelliteName(satellite)}

		<option value={satellite.satellite_id.toText()}>{satName}</option>
	{/each}
</select>
