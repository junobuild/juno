<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import type {
		CyclesBalance,
		Monitoring
	} from '$declarations/mission_control/mission_control.did';
	import Canister from '$lib/components/canister/Canister.svelte';
	import Chart from '$lib/components/charts/Chart.svelte';
	import IconClockUpdate from '$lib/components/icons/IconClockUpdate.svelte';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import CanisterMonitoringLoader from '$lib/components/loaders/CanisterMonitoringLoader.svelte';
	import type { CanisterData, CanisterMonitoringData, Segment } from '$lib/types/canister';
	import type { ChartsData } from '$lib/types/chart';
	import { formatToRelativeTime } from '$lib/utils/date.utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	interface Props {
		children: Snippet;
		monitoring: Monitoring | undefined;
		canisterId: Principal;
		segment: Segment;
	}

	let { children, monitoring, segment, canisterId }: Props = $props();

	let enabled = $derived(fromNullable(monitoring?.cycles ?? [])?.enabled === true);

	let monitoringData: CanisterMonitoringData | undefined = $state(undefined);
	let canisterData: CanisterData | undefined = $state(undefined);

	let chartsData: ChartsData[] = $derived(monitoringData?.chartsData ?? []);

	let lastExecutionTime: bigint | undefined = $derived(monitoringData?.metadata?.lastExecutionTime);
	let lastDepositCyclesTime: bigint | undefined = $derived(
		monitoringData?.metadata?.latestDepositedCycles?.timestamp
	);
	let lastDepositCyclesAmount: bigint | undefined = $derived(
		monitoringData?.metadata?.latestDepositedCycles?.amount
	);
</script>

<Canister {canisterId} {segment} display={false} bind:data={canisterData} />

<CanisterMonitoringLoader {segment} {canisterId} bind:data={monitoringData}>
	<button onclick={() => console.log('todo')} class="article monitoring">
		<span class="segment">
			{@render children()}
		</span>

		<span><Canister {segment} {canisterId} row={true} /></span>

		{#if enabled}
			<span class="chart-container">
				<Chart {chartsData} axis={false} padding={{ top: 0, right: 0, bottom: 0, left: 0 }} />
			</span>

			<span class="info">
				{#if nonNullish(lastExecutionTime)}
					<span in:fade><IconClockUpdate /> {formatToRelativeTime(lastExecutionTime)}</span>
				{/if}
				{#if nonNullish(lastDepositCyclesTime) && nonNullish(lastDepositCyclesAmount)}
					<span in:fade
						><IconRefresh size="16px" />
						{formatToRelativeTime(lastDepositCyclesTime)} with {formatTCycles(lastDepositCyclesAmount)} T Cycles</span
					>
				{/if}
			</span>
		{:else}
			<span class="info">Monitoring disabled.</span>
		{/if}
	</button>
</CanisterMonitoringLoader>

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/text';

	.segment {
		display: flex;
		align-items: center;
		gap: var(--padding);

		:global(svg) {
			min-width: 24px;
		}

		:global(span) {
			@include text.truncate;
		}
	}

	.info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--padding);

		font-size: var(--font-size-small);
	}

	button.article.monitoring {
		grid-column: 1 / 13;
		align-items: center;

		padding: var(--padding-2x) var(--padding-4x);

		@include media.min-width(medium) {
			display: grid;
			grid-template-columns: 20% repeat(3, auto);
			grid-gap: var(--padding-8x);
		}
	}

	.chart-container {
		height: 100%;
		width: 100px;
		fill: var(--value-color);
	}
</style>
