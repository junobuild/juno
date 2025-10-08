<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { MissionControlDid } from '$declarations';
	import SegmentsTable from '$lib/components/segments/SegmentsTable.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
		selectedSatellites: [Principal, MissionControlDid.Satellite][];
		selectedOrbiters: [Principal, MissionControlDid.Orbiter][];
		onlySyncedSegments?: boolean;
		oncontinue: () => void;
		children: Snippet;
	}

	let {
		missionControlId,
		selectedSatellites = $bindable([]),
		selectedOrbiters = $bindable([]),
		onlySyncedSegments,
		oncontinue,
		children
	}: Props = $props();

	let selectedDisabled = $state(true);

	let loadingSegments = $state<'loading' | 'ready' | 'error'>('loading');
</script>

{@render children()}

<SegmentsTable
	{missionControlId}
	{onlySyncedSegments}
	reloadSegments={false}
	withMissionControl={false}
	bind:selectedSatellites
	bind:selectedOrbiters
	bind:selectedDisabled
	bind:loadingSegments
></SegmentsTable>

{#if loadingSegments === 'ready'}
	<button disabled={$isBusy || selectedDisabled} onclick={oncontinue} in:fade>
		{$i18n.core.continue}
	</button>
{/if}
