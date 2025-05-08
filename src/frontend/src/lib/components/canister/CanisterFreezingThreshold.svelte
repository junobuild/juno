<script lang="ts">
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterDataInfo, CanisterSyncStatus } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils.js';
	import { secondsToDuration } from '$lib/utils/date.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { formatNumber } from '$lib/utils/number.utils';
	import IconCheckCircle from '$lib/components/icons/IconCheckCircle.svelte';
	import IconWarning from "$lib/components/icons/IconWarning.svelte";
	import InlineWarning from "$lib/components/ui/InlineWarning.svelte";
	import IconClose from "$lib/components/icons/IconClose.svelte";
	import IconError from "$lib/components/icons/IconError.svelte";

	interface Props {
		canister: CanisterDataInfo | undefined;
		sync: CanisterSyncStatus | undefined;
	}

	let { canister, sync }: Props = $props();

	let idleCyclesBurnedPerDay = $derived(canister?.idleCyclesBurnedPerDay * 1123n ?? 0n);
	let freezingThreshold = $derived(canister?.settings.freezingThreshold ?? 0n);

	let cyclesReserve = $derived((idleCyclesBurnedPerDay * freezingThreshold) / 86_400n);

	let cyclesBalance = $derived(canister?.cycles ?? 0n);

	let maxType = $derived(cyclesReserve > cyclesBalance ? 'freeze' : 'balance');

	let progressionReserve = $derived(
		maxType === 'freeze' && cyclesReserve > 0n
			? 100
			: cyclesBalance > 0n
				? (100 * Number(cyclesReserve)) / Number(cyclesBalance)
				: 0
	);
	let progressionBalance = $derived(
		maxType === 'balance' && cyclesBalance > 0n
			? 100
			: cyclesReserve > 0n
				? (100 * Number(cyclesBalance)) / Number(cyclesReserve)
				: 0
	);

	let warning = $derived(maxType === 'freeze' && cyclesReserve > 0n);
	let ratio = $derived(cyclesReserve > 0 ? Number(cyclesBalance) / Number(cyclesReserve) : 0);
</script>

<div class="freezing">
	<CanisterValue {sync} rows={3}>
		{#snippet label()}
			Survival Check
		{/snippet}

		<div class="container">
			<p>
				The grace period is set to {secondsToDuration(freezingThreshold ?? 0n)}.
			</p>

			<span class="label">Cycles needed:</span>
			<div class="progress-bar-container">
				<div class="progress-bar" style={`width: ${progressionReserve}%`}></div>
			</div>
			<span class="progress-bar-value"
				>{formatTCycles(cyclesReserve ?? 0n)}T <small>cycles</small></span
			>

			<span class="label">Current Balance:</span>
			<div class="progress-bar-container">
				<div
					class="progress-bar"
					class:progress-bar-warning={warning}
					style={`width: ${progressionBalance}%`}
				></div>
			</div>
			<span class="progress-bar-value"
				>{formatTCycles(cyclesBalance ?? 0n)}T <small>cycles</small></span
			>

			<p class="space">
				<span class="label">Status:</span>
				<span>
					{#if ratio >= 1}
						<span class="safe"><IconCheckCircle size="16px" /></span> Safe
						<small
							>— {formatNumber(ratio * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small> of cycles
							needed</small
						>
					{:else if ratio >= 0.9}
						<InlineWarning title="Low" iconSize="16" /> <strong>Low</strong>
						<small
							>— {formatNumber(ratio * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small> of cycles
							needed</small
						>
					{:else}
						<IconError size="20px" /> <strong>At Risk</strong>
						<small
							>— Only {formatNumber(ratio * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small
							> of cycles needed</small
						>
					{/if}
				</span>
			</p>
		</div>
	</CanisterValue>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.freezing {
		min-height: calc(54px + var(--padding-2_5x));

		@include media.min-width(large) {
			max-width: 80%;
		}
	}

	.container {
		display: grid;
		grid-template-columns: auto 1fr auto;
		column-gap: var(--padding);
	}

	.progress-bar-container {
		flex: 2;
		display: flex;

		grid-column: 1 / 3;

		@include media.min-width(large) {
			grid-column: auto;
		}
	}

	.progress-bar {
		background: rgba(var(--color-primary-rgb), 0.25);
		border: 1px solid var(--color-primary);

		border-radius: var(--border-radius);

		height: var(--padding-2x);
		align-self: center;

		transition: width var(--animation-time) ease-out;

		&.progress-bar-warning {
			background: rgba(var(--color-warning-rgb), 0.25);
			border: 1px solid var(--color-warning);
		}
	}

	.label {
		color: var(--value-color);
	}

	.progress-bar-value {
		font-size: var(--font-size-small);

		align-self: center;
	}

	p {
		grid-column: 1 / 4;

		--icon-text-align: middle;
	}

	.space {
		padding: var(--padding-2_5x) 0 0;
	}

	.safe {
		color: var(--color-success);
	}
</style>
