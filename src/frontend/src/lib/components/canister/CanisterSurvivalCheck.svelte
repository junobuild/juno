<script lang="ts">
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import IconCheckCircle from '$lib/components/icons/IconCheckCircle.svelte';
	import IconError from '$lib/components/icons/IconError.svelte';
	import InlineWarning from '$lib/components/ui/InlineWarning.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterDataInfo, CanisterSyncStatus } from '$lib/types/canister';
	import { freezingThresholdCycles } from '$lib/utils/canister.utils';
	import { formatTCycles } from '$lib/utils/cycles.utils.js';
	import { secondsToDuration } from '$lib/utils/date.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatNumber } from '$lib/utils/number.utils';

	interface Props {
		canister: CanisterDataInfo | undefined;
		sync: CanisterSyncStatus | undefined;
	}

	let { canister, sync }: Props = $props();

	let freezingThreshold = $derived(canister?.settings.freezingThreshold ?? 0n);

	let cyclesNeeded = $derived(freezingThresholdCycles(canister));

	let cyclesBalance = $derived(canister?.cycles ?? 0n);

	let maxType = $derived(cyclesNeeded > cyclesBalance ? 'freeze' : 'balance');

	let progressionReserve = $derived(
		maxType === 'freeze' && cyclesNeeded > 0n
			? 100
			: cyclesBalance > 0n
				? (100 * Number(cyclesNeeded)) / Number(cyclesBalance)
				: 0
	);
	let progressionBalance = $derived(
		maxType === 'balance' && cyclesBalance > 0n
			? 100
			: cyclesNeeded > 0n
				? (100 * Number(cyclesBalance)) / Number(cyclesNeeded)
				: 0
	);

	let warning = $derived(maxType === 'freeze' && cyclesNeeded > 0n);
	let ratio = $derived(cyclesNeeded > 0 ? Number(cyclesBalance) / Number(cyclesNeeded) : 0);
</script>

<div class="freezing">
	<CanisterValue {sync} rows={3}>
		{#snippet label()}
			{$i18n.canisters.survival_check}
		{/snippet}

		<div class="container">
			<p>
				{i18nFormat($i18n.canisters.grace_period, [
					{
						placeholder: '{0}',
						value: secondsToDuration(freezingThreshold ?? 0n)
					}
				])}
			</p>

			<label class="progress-bar-label" for="cycles-needed">{$i18n.canisters.cycles_needed}:</label>
			<div class="progress-bar-container">
				<div class="progress-bar" style={`width: ${progressionReserve}%`}></div>
			</div>
			<span class="progress-bar-value" id="cycles-needed"
				>{formatTCycles(cyclesNeeded ?? 0n)}T <small>cycles</small></span
			>

			<label class="progress-bar-label" for="current-balance"
				>{$i18n.canisters.current_balance}:</label
			>
			<div class="progress-bar-container">
				<div
					class="progress-bar"
					class:progress-bar-warning={warning}
					style={`width: ${progressionBalance}%`}
				></div>
			</div>
			<span class="progress-bar-value" id="current-balance"
				>{formatTCycles(cyclesBalance ?? 0n)}T <small>cycles</small></span
			>

			<p class="space">
				<label for="safety">{$i18n.canisters.safety}:</label>
				<span id="safety">
					{#if ratio >= 1}
						<span class="safe"><IconCheckCircle size="16px" /></span>
						{$i18n.canisters.safe}
						<small
							>— {formatNumber(ratio * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small>
							{$i18n.canisters.of_cycles_needed}</small
						>
					{:else if ratio >= 0.9}
						<InlineWarning title="Low" iconSize="16" /> <strong>{$i18n.canisters.low}</strong>
						<small
							>— {formatNumber(ratio * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small>
							{$i18n.canisters.of_cycles_needed}</small
						>
					{:else}
						<IconError size="20px" /> <strong>{$i18n.canisters.risk}</strong>
						<small
							>— {$i18n.canisters.only}
							{formatNumber(ratio * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small>
							{$i18n.canisters.of_cycles_needed}</small
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

	.progress-bar-label {
		grid-column: 1 / 4;

		@include media.min-width(large) {
			grid-column: auto;
		}
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

	label {
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
		padding: var(--padding-3x) 0 0;
	}

	.safe {
		color: var(--color-success);
	}
</style>
