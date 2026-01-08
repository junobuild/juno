<script lang="ts">
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { getIcpToCyclesConversionRate } from '$lib/api/cmc.api';
	import InputIcp from '$lib/components/core/InputIcp.svelte';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { ICP_TOP_UP_FEE } from '$lib/constants/token.constants';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { formatTCycles, icpNumberToCycles } from '$lib/utils/cycles.utils';

	interface Props {
		balance: bigint;
		amount: string | undefined;
		displayTCycles: string | undefined;
	}

	let {
		balance,
		amount = $bindable(undefined),
		displayTCycles = $bindable(undefined)
	}: Props = $props();

	let trillionRatio = $state<bigint | undefined>();
	onMount(async () => (trillionRatio = await getIcpToCyclesConversionRate()));

	let convertedCycles = $derived(
		nonNullish(trillionRatio) && !isNaN(Number(amount)) && notEmptyString(amount)
			? icpNumberToCycles({ icp: Number(amount), trillionRatio })
			: undefined
	);

	$effect(() => {
		displayTCycles = nonNullish(convertedCycles)
			? `${formatTCycles(BigInt(convertedCycles ?? 0))}`
			: undefined;
	});
</script>

<div class="group-cycles">
	<InputIcp {balance} fee={ICP_TOP_UP_FEE} bind:amount />

	<GridArrow small />

	<div>
		<Value>
			{#snippet label()}
				{$i18n.canisters.converted_cycles}
			{/snippet}

			<span class="cycles" class:fill={notEmptyString(displayTCycles)}
				>{displayTCycles ?? ''}&ZeroWidthSpace;</span
			>
		</Value>
	</div>
</div>

<style lang="scss">
	@use '../../../styles/mixins/media';

	.group-cycles {
		@include media.min-width(large) {
			grid-column: 1 / 3;

			display: grid;
			grid-template-columns: 1fr min-content 1fr;
			column-gap: var(--padding-2x);
		}
	}

	.cycles {
		display: inline-block;
		padding: var(--padding) var(--padding-2x);
		margin: var(--padding) 0 var(--padding-2x);
		width: 100%;
		max-width: 100%;
		border: 1px solid rgb(var(--color-card-contrast-rgb), 0.1);
		border-radius: var(--border-radius);
		background: var(--color-card);
		color: var(--color-card-contrast);
		transition: all var(--animation-time) ease-out;

		&.fill {
			background: rgba(var(--color-tertiary-rgb), 0.1);
			border: 1px solid var(--color-tertiary);
		}
	}
</style>
