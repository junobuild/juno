<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
	import { onMount, type Snippet, untrack } from 'svelte';
	import { icpXdrConversionRate } from '$lib/api/cmc.api';
	import CanisterTopUpCycles from '$lib/components/canister/CanisterTopUpCycles.svelte';
	import InputIcp from '$lib/components/core/InputIcp.svelte';
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import SendTokensMax from '$lib/components/tokens/SendTokensMax.svelte';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { TOP_UP_NETWORK_FEES } from '$lib/constants/constants';
	import { icpToUsd } from '$lib/derived/exchange.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import { formatTCycles, icpToCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatICPToHTML } from '$lib/utils/icp.utils';
	import { assertAndConvertAmountToICPToken } from '$lib/utils/token.utils';

	interface Props {
		intro?: Snippet;
		segment: CanisterSegmentWithLabel;
		balance: bigint;
		accountIdentifier: AccountIdentifier | undefined;
		icp: string | undefined;
		cycles: number | undefined;
		onreview: () => void;
		onclose: () => void;
	}

	let {
		accountIdentifier,
		onreview,
		intro,
		segment,
		balance,
		onclose,
		icp = $bindable(undefined),
		cycles = $bindable(undefined)
	}: Props = $props();

	let trillionRatio: bigint | undefined = $state();
	onMount(async () => (trillionRatio = await icpXdrConversionRate()));

	let convertedCycles: number | undefined = $derived(
		nonNullish(trillionRatio) && !isNaN(Number(icp)) && nonNullish(icp)
			? icpToCycles({ icp: Number(icp), trillionRatio })
			: undefined
	);

	$effect(() => {
		cycles = convertedCycles;
	});

	let displayTCycles: string | undefined = $state(undefined);

	$effect(() => {
		displayTCycles = nonNullish(cycles) ? `${formatTCycles(BigInt(cycles ?? 0))}` : '';
	});

	const onSubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		const { valid } = assertAndConvertAmountToICPToken({
			balance,
			amount: icp,
			fee: TOP_UP_NETWORK_FEES
		});

		if (!valid) {
			return;
		}

		onreview();
	};
</script>

{@render intro?.()}

<p>
	{i18nFormat($i18n.canisters.cycles_description, [
		{
			placeholder: '{0}',
			value: segment.segment.replace('_', ' ')
		}
	])}
	<Html
		text={i18nFormat($i18n.canisters.top_up_info, [
			{
				placeholder: '{0}',
				value: formatICPToHTML({ e8s: balance, bold: false, icpToUsd: $icpToUsd })
			}
		])}
	/>
</p>

{#if balance <= TOP_UP_NETWORK_FEES}
	<MissionControlICPInfo {accountIdentifier} {onclose} />
{:else}
	<form onsubmit={onSubmit}>
		<div class="columns">
			<InputIcp bind:amount={icp} {balance} />

			<GridArrow small />

			<div>
				<Value>
					{#snippet label()}
						{$i18n.canisters.converted_cycles}
					{/snippet}

					<span class="cycles" class:fill={notEmptyString(displayTCycles)}
						>{displayTCycles}&ZeroWidthSpace;</span
					>
				</Value>
			</div>
		</div>

		<button type="submit" disabled={isNullish($missionControlIdDerived) || isNullish(cycles)}
			>{$i18n.core.review}</button
		>
	</form>
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/grid';

	.columns {
		@include media.min-width(large) {
			@include grid.two-columns-with-arrow;
		}
	}

	p {
		min-height: 24px;
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
