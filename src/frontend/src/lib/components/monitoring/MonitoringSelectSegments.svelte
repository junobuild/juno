<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { MissionControlDid } from '$declarations';
	import SegmentsTable from '$lib/components/segments/SegmentsTable.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { isBusy } from '$lib/derived/app/busy.derived';

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
