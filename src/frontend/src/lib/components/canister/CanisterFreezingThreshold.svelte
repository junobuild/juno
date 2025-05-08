<script lang="ts">
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterDataInfo, CanisterSyncStatus } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils.js';
	import { secondsToDuration } from '$lib/utils/date.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { formatNumber } from '$lib/utils/number.utils';

	interface Props {
		canister: CanisterDataInfo | undefined;
		sync: CanisterSyncStatus | undefined;
	}

	let { canister, sync }: Props = $props();

	let idleCyclesBurnedPerDay = $derived(canister?.idleCyclesBurnedPerDay * 1115n ?? 0n);
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
			<span class="label">{$i18n.canisters.freezing_threshold}:</span>
			<span class="description">{secondsToDuration(freezingThreshold ?? 0n)}</span>

			<span class="label">Required Reserve:</span>
			<div class="progress-bar" style={`width: ${progressionReserve}%`}></div>
			<span class="progress-bar-value"
				>{formatTCycles(cyclesReserve ?? 0n)}T <small>cycles</small></span
			>

			<span class="label">Current Balance:</span>
			<div
				class="progress-bar"
				class:progress-bar-warning={warning}
				style={`width: ${progressionBalance}%`}
			></div>
			<span class="progress-bar-value"
				>{formatTCycles(cyclesBalance ?? 0n)}T <small>cycles</small></span
			>

			<span class="label">Status:</span>
			<span class="description">
				{#if ratio >= 1}
					✅ Safe <small
						>— {formatNumber(ratio * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small> of required
						reserve</small
					>
				{:else if ratio >= 0.9}
					⚠️ Low <small
						>— {formatNumber(ratio * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small> of required
						reserve</small
					>
				{:else}
					❌ At Risk <small
						>— Only {formatNumber(ratio * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small> of
						required reserve</small
					>
				{/if}
			</span>
		</div>
	</CanisterValue>
</div>

<style lang="scss">
	.freezing {
		min-height: calc(54px + var(--padding-2_5x));
	}

	.container {
		display: grid;
		grid-template-columns: auto 1fr auto;
		column-gap: var(--padding-2x);
	}

	.progress-bar {
		flex: 2;

		background: rgba(var(--color-primary-rgb), 0.25);
		border: 1px solid var(--color-primary);

		border-radius: var(--border-radius);

		margin: 2px 0;

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
	}

	.description {
		grid-column: 2 / 4;
	}
</style>
