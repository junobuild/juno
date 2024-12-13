<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { Principal } from '@dfinity/principal';
	import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
	import Value from '$lib/components/ui/Value.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Segment from '$lib/components/segments/Segment.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { orbiterName } from '$lib/utils/orbiter.utils';
	import { notEmptyString } from '@dfinity/utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { isBusy } from '$lib/stores/busy.store';

	interface Props {
		missionControlId: Principal;
		selectedMissionControl: boolean;
		selectedSatellites: [Principal, Satellite][];
		selectedOrbiters: [Principal, Orbiter][];
		minCycles: bigint;
		fundCycles: bigint;
		onback: () => void;
		onsubmit: ($event: MouseEvent | TouchEvent) => Promise<void>;
	}

	let {
		missionControlId,
		selectedMissionControl,
		selectedSatellites,
		selectedOrbiters,
		minCycles,
		fundCycles,
		onback,
		onsubmit
	}: Props = $props();
</script>

<h2>{$i18n.monitoring.title}</h2>

<p>{$i18n.monitoring.review_info}</p>

<Value>
	{#snippet label()}
		{$i18n.monitoring.selected_modules}
	{/snippet}

	<ul>
		{#if selectedMissionControl}
			<li>
				<Segment id={missionControlId}>
					{$i18n.mission_control.title}
				</Segment>
			</li>
		{/if}

		{#each selectedSatellites as [satelliteId, satellite]}
			<li>
				<Segment id={satelliteId}>
					{satelliteName(satellite)}
				</Segment>
			</li>
		{/each}

		{#each selectedOrbiters as [orbiterId, orbiter]}
			{@const orbName = orbiterName(orbiter)}

			<li>
				<Segment id={orbiterId}>
					{!notEmptyString(orbName) ? $i18n.analytics.title : orbName}
				</Segment>
			</li>
		{/each}
	</ul>
</Value>

<Value>
	{#snippet label()}
		{$i18n.monitoring.remaining_threshold}
	{/snippet}

	<p>{formatTCycles(minCycles)}</p>
</Value>

<Value>
	{#snippet label()}
		{$i18n.monitoring.top_up_amount}
	{/snippet}

	<p>{formatTCycles(fundCycles)}</p>
</Value>

<div class="toolbar">
	<button type="button" disabled={$isBusy} onclick={onback}>{$i18n.core.back}</button>
	<button type="button" disabled={$isBusy} onclick={onsubmit}>
		{$i18n.core.apply}
	</button>
</div>

<style lang="scss">
	ul {
		padding: var(--padding) var(--padding-2_5x) 0;
		margin: 0 0 var(--padding-2_5x);
	}

	li {
		margin: 0 0 var(--padding);
	}
</style>
