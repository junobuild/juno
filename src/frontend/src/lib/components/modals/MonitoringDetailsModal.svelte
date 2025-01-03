<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CanisterMonitoringChart from '$lib/components/canister/CanisterMonitoringChart.svelte';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterMonitoringLoader from '$lib/components/loaders/CanisterMonitoringLoader.svelte';
	import MonitoringDepositCyclesChart from '$lib/components/monitoring/MonitoringDepositCyclesChart.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterMonitoringData } from '$lib/types/canister';
	import type {
		JunoModalDetail,
		JunoModalSegmentDetail,
		JunoModalShowMonitoringDetail
	} from '$lib/types/modal';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { formatToRelativeTime } from '$lib/utils/date.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import MonitoringDisabled from '$lib/components/monitoring/MonitoringDisabled.svelte';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { segment, monitoring } = $derived(detail as JunoModalShowMonitoringDetail);

	let canisterId = $derived(Principal.fromText(segment?.canisterId));

	let monitoringData = $state<CanisterMonitoringData | undefined>(undefined);

	let lastExecutionTime = $derived(monitoringData?.metadata?.lastExecutionTime);
	let lastDepositCyclesTime = $derived(monitoringData?.metadata?.latestDepositedCycles?.timestamp);
	let lastDepositCyclesAmount = $derived(monitoringData?.metadata?.latestDepositedCycles?.amount);

	let chartsData = $derived(monitoringData?.chartsData ?? []);

	let depositedCyclesChartData = $derived(monitoringData?.charts.depositedCycles ?? []);

	let monitoringStrategy = $derived(
		fromNullable(fromNullable(monitoring?.cycles ?? [])?.strategy ?? [])
	);
</script>

<Modal on:junoClose={onclose}>
	<h2>{$i18n.monitoring.title}</h2>

	<div class="card-container columns-3 no-border">
		<CanisterOverview {canisterId} segment={segment.segment} />

		<CanisterMonitoringLoader segment={segment.segment} {canisterId} bind:data={monitoringData}>
			<div>
				<div>
					{#if nonNullish(monitoringStrategy)}
						<Value>
							{#snippet label()}
								{$i18n.monitoring.auto_refill}
							{/snippet}

							<p>
								{i18nFormat($i18n.monitoring.auto_refill_strategy, [
									{
										placeholder: '{0}',
										value: formatTCycles(monitoringStrategy.BelowThreshold.min_cycles)
									},
									{
										placeholder: '{1}',
										value: formatTCycles(monitoringStrategy.BelowThreshold.fund_cycles)
									}
								])}
							</p>
						</Value>
					{:else}
						<MonitoringDisabled {monitoring} loading={false} />
					{/if}
				</div>

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
		</CanisterMonitoringLoader>
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
</style>
