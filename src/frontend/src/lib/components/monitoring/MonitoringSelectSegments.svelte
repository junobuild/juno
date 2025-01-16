<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
	import SegmentsTable from '$lib/components/segments/SegmentsTable.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
		selectedSatellites: [Principal, Satellite][];
		selectedOrbiters: [Principal, Orbiter][];
		oncontinue: () => void;
		children: Snippet;
	}

	let {
		missionControlId,
		selectedSatellites = $bindable([]),
		selectedOrbiters = $bindable([]),
		oncontinue,
		children
	}: Props = $props();

	let selectedDisabled = $state(true);
</script>

{@render children()}

<SegmentsTable
	{missionControlId}
	bind:selectedSatellites
	bind:selectedOrbiters
	bind:selectedDisabled
	withMissionControl={false}
	reloadSegments={false}
></SegmentsTable>

<button disabled={$isBusy || selectedDisabled} onclick={oncontinue}>
	{$i18n.core.continue}
</button>
