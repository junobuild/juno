<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CanisterMonitoringChart from '$lib/components/canister/CanisterMonitoringChart.svelte';
	import CanisterMonitoringData from '$lib/components/canister/CanisterMonitoringData.svelte';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import MonitoringDepositCyclesChart from '$lib/components/monitoring/MonitoringDepositCyclesChart.svelte';
	import MonitoringStrategyStatus from '$lib/components/monitoring/MonitoringStrategyStatus.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type {
		CanisterData,
		CanisterMonitoringData as CanisterMonitoringDataType,
		CanisterSyncStatus
	} from '$lib/types/canister';
	import type { JunoModalDetail, JunoModalShowMonitoringDetail } from '$lib/types/modal';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { formatToRelativeTime } from '$lib/utils/date.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { segment, monitoring } = $derived(detail as JunoModalShowMonitoringDetail);

	let canisterId = $derived(Principal.fromText(segment?.canisterId));

	let monitoringData = $state<CanisterMonitoringDataType | undefined>(undefined);

	let lastExecutionTime = $derived(monitoringData?.metadata?.lastExecutionTime);
	let lastDepositCyclesTime = $derived(monitoringData?.metadata?.latestDepositedCycles?.timestamp);
	let lastDepositCyclesAmount = $derived(monitoringData?.metadata?.latestDepositedCycles?.amount);

	let chartsData = $derived(monitoringData?.chartsData ?? []);

	let depositedCyclesChartData = $derived(monitoringData?.charts.depositedCycles ?? []);

	let canisterData = $state<CanisterData | undefined>(undefined);
	let canisterSyncStatus = $state<CanisterSyncStatus | undefined>(undefined);
</script>

<Modal on:junoClose={onclose}>
	<h2>{$i18n.monitoring.title}</h2>

	<div class="card-container columns-3 no-border">
		<CanisterOverview
			bind:data={canisterData}
			bind:sync={canisterSyncStatus}
			{canisterId}
			segment={segment.segment}
		/>

		<CanisterMonitoringData {canisterId} bind:monitoringData>
			<div class="status">
				<MonitoringStrategyStatus {monitoring} {canisterData} {canisterSyncStatus} />

				{#if nonNullish(lastExecutionTime)}
					<div in:fade>
						<Value>
							{#snippet label()}
								{$i18n.monitoring.last_status_check}
							{/snippet}

							<p>
								{formatToRelativeTime(lastExecutionTime)}
							</p>
						</Value>
					</div>
				{/if}

				{#if nonNullish(lastDepositCyclesTime) && nonNullish(lastDepositCyclesAmount)}
					<div in:fade>
						<Value>
							{#snippet label()}
								{$i18n.monitoring.last_top_up}
							{/snippet}

							<p>
								{formatToRelativeTime(lastDepositCyclesTime)} with {formatTCycles(
									lastDepositCyclesAmount
								)}T <small>Cycles</small>
							</p>
						</Value>
					</div>
				{/if}
			</div>

			<div class="chart">
				<CanisterMonitoringChart {chartsData} />
			</div>

			<MonitoringDepositCyclesChart depositedCycles={depositedCyclesChartData} />
		</CanisterMonitoringData>
	</div>
</Modal>

<style lang="scss">
	@use '../../styles/mixins/media';

	.card-container {
		padding: var(--padding-2x) var(--padding-2x) 0 0;
	}

	p {
		&::first-letter {
			text-transform: uppercase;
		}
	}

	.chart {
		@include media.min-width(medium) {
			grid-column: 1 / 3;
		}
	}

	.status {
		margin: var(--padding-6x) 0 var(--padding-8x);

		@include media.min-width(medium) {
			margin: var(--padding-6x) 0 var(--padding-4x);
			grid-column: 1 / 4;
		}
	}
</style>
