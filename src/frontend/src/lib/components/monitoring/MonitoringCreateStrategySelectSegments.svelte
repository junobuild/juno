<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
	import SegmentsTable from '$lib/components/core/SegmentsTable.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		missionControlId: Principal;
		selectedMissionControl: boolean;
		selectedSatellites: [Principal, Satellite][];
		selectedOrbiters: [Principal, Orbiter][];
		oncontinue: () => void;
	}

	let {
		missionControlId,
		selectedMissionControl = $bindable(false),
		selectedSatellites = $bindable([]),
		selectedOrbiters = $bindable([]),
		oncontinue
	}: Props = $props();

	let selectedDisabled = $state(true);
</script>

<h2>{$i18n.monitoring.title}</h2>

<p>{$i18n.monitoring.create_info}</p>

<SegmentsTable
	{missionControlId}
	bind:selectedMissionControl
	bind:selectedSatellites
	bind:selectedOrbiters
	bind:selectedDisabled
></SegmentsTable>

<button disabled={$isBusy || selectedDisabled} onclick={oncontinue}>
	{$i18n.core.continue}
</button>
