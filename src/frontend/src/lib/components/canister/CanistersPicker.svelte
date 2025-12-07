<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import { onMount } from 'svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { sortedSatellites } from '$lib/derived/mission-control/satellites.derived';
	import { orbiterStore } from '$lib/derived/orbiter/orbiter.derived';
	import { loadOrbiters } from '$lib/services/mission-control/mission-control.orbiters.services';
	import { loadSatellites } from '$lib/services/mission-control/mission-control.satellites.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		excludeSegmentId: Principal;
		segmentIdText?: string | undefined;
	}

	let { excludeSegmentId, segmentIdText = $bindable(undefined) }: Props = $props();

	let excludeSegmentIdText: string = $derived(excludeSegmentId.toText());

	let satellites = $derived(
		$sortedSatellites.filter(({ satellite_id }) => satellite_id.toText() !== excludeSegmentIdText)
	);

	onMount(
		async () =>
			await Promise.all([
				loadOrbiters({ missionControlId: $missionControlId }),
				loadSatellites({ missionControlId: $missionControlId })
			])
	);
</script>

<select id="segment" name="segment" bind:value={segmentIdText}>
	{#if isNullish(segmentIdText)}
		<option value={undefined}>{$i18n.canisters.select_destination}</option>
	{/if}

	{#if nonNullish($missionControlId) && $missionControlId.toText() !== excludeSegmentIdText}
		<option value={$missionControlId.toText()}>{$i18n.mission_control.title}</option>
	{/if}

	{#if nonNullish($orbiterStore) && $orbiterStore.orbiter_id.toText() !== excludeSegmentIdText}
		<option value={$orbiterStore.orbiter_id.toText()}>{$i18n.analytics.title}</option>
	{/if}

	{#each satellites as satellite (satellite.satellite_id.toText())}
		{@const satName = satelliteName(satellite)}

		<option value={satellite.satellite_id.toText()}>{satName}</option>
	{/each}
</select>
