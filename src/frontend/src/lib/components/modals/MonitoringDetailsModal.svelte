<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CanisterMonitoring from '$lib/components/canister/CanisterMonitoring.svelte';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalMonitoringDetail } from '$lib/types/modal';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { formatToRelativeTime } from '$lib/utils/date.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { segment, canisterData, monitoringData } = $derived(detail as JunoModalMonitoringDetail);

	let canisterId = $derived(Principal.fromText(segment?.canisterId));

	let lastExecutionTime = $derived(monitoringData?.metadata?.lastExecutionTime);
	let lastDepositCyclesTime = $derived(monitoringData?.metadata?.latestDepositedCycles?.timestamp);
	let lastDepositCyclesAmount = $derived(monitoringData?.metadata?.latestDepositedCycles?.amount);
</script>

<Modal on:junoClose={onclose}>
	<h2>{$i18n.monitoring.title}</h2>

	<div class="card-container columns-3 no-border">
		<CanisterOverview {canisterId} segment={segment.segment} />

		<div>
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
			<CanisterMonitoring {canisterId} segment={segment.segment} />
		</div>
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
			grid-column: 1 / 4;
		}
	}
</style>
