<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import type {
		CyclesMonitoringStrategy,
		Orbiter,
		Satellite
	} from '$declarations/mission_control/mission_control.did';
	import Segment from '$lib/components/segments/Segment.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { orbiterName } from '$lib/utils/orbiter.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		selectedSatellites: [Principal, Satellite][];
		selectedOrbiters: [Principal, Orbiter][];
		minCycles: bigint | undefined;
		fundCycles: bigint | undefined;
		missionControlMinCycles: bigint | undefined;
		missionControlFundCycles: bigint | undefined;
		missionControl: { monitored: boolean; strategy: CyclesMonitoringStrategy | undefined };
		onback: () => void;
		onsubmit: ($event: MouseEvent | TouchEvent) => Promise<void>;
	}

	let {
		selectedSatellites,
		selectedOrbiters,
		minCycles,
		fundCycles,
		missionControlMinCycles,
		missionControlFundCycles,
		missionControl,
		onback,
		onsubmit
	}: Props = $props();
</script>

<h2>{$i18n.monitoring.review_strategy}</h2>

<p>{$i18n.monitoring.review_info}</p>

{#if !missionControl.monitored || (nonNullish(missionControlFundCycles) && nonNullish(missionControlMinCycles))}
	<div class="card-container with-title">
		<span class="title">{$i18n.mission_control.title}</span>

		<div class="content">
			<Value>
				{#snippet label()}
					{$i18n.monitoring.remaining_threshold}
				{/snippet}

				<p>{formatTCycles(missionControlMinCycles ?? minCycles ?? 0n)}</p>
			</Value>

			<Value>
				{#snippet label()}
					{$i18n.monitoring.top_up_amount}
				{/snippet}

				<p class="no-margin">{formatTCycles(missionControlFundCycles ?? fundCycles ?? 0n)}</p>
			</Value>
		</div>
	</div>
{/if}

<div class="card-container with-title">
	<span class="title">{$i18n.monitoring.modules}</span>

	<div class="content">
		<Value>
			{#snippet label()}
				{$i18n.monitoring.selected_modules}
			{/snippet}

			<ul>
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

			<p>{formatTCycles(minCycles ?? 0n)}</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.monitoring.top_up_amount}
			{/snippet}

			<p>{formatTCycles(fundCycles ?? 0n)}</p>
		</Value>
	</div>
</div>

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

	.no-margin {
		margin: 0;
	}
</style>
