<script lang="ts">
	import { isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import { getIcpToCyclesConversionRate } from '$lib/api/cmc.api';
	import InputIcp from '$lib/components/core/InputIcp.svelte';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import GetICPInfo from '$lib/components/wallet/GetICPInfo.svelte';
	import WalletPicker from '$lib/components/wallet/WalletPicker.svelte';
	import { TOP_UP_NETWORK_FEES } from '$lib/constants/app.constants';
	import {
		devBalanceOrZero,
		missionControlBalanceOrZero
	} from '$lib/derived/wallet/balance.derived';
	import { icpToUsd } from '$lib/derived/wallet/exchange.derived';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import { formatTCycles, icpToCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatICPToHTML } from '$lib/utils/icp.utils';
	import { assertAndConvertAmountToICPToken } from '$lib/utils/token.utils';

	interface Props {
		intro?: Snippet;
		segment: CanisterSegmentWithLabel;
		selectedWallet: SelectedWallet | undefined;
		balance: bigint;
		icp: string | undefined;
		cycles: number | undefined;
		onreview: () => void;
		onclose: () => void;
	}

	let {
		onreview,
		intro,
		segment,
		selectedWallet = $bindable(undefined),
		balance = $bindable(0n),
		onclose,
		icp = $bindable(undefined),
		cycles = $bindable(undefined)
	}: Props = $props();

	let trillionRatio: bigint | undefined = $state();
	onMount(async () => (trillionRatio = await getIcpToCyclesConversionRate()));

	let convertedCycles: number | undefined = $derived(
		nonNullish(trillionRatio) && !isNaN(Number(icp)) && nonNullish(icp)
			? icpToCycles({ icp: Number(icp), trillionRatio })
			: undefined
	);

	$effect(() => {
		cycles = convertedCycles;
	});

	let displayTCycles = $derived(nonNullish(cycles) ? `${formatTCycles(BigInt(cycles ?? 0))}` : '');

	$effect(() => {
		balance =
			selectedWallet?.type === 'mission_control' ? $missionControlBalanceOrZero : $devBalanceOrZero;
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
	<GetICPInfo {onclose} />
{:else}
	<form onsubmit={onSubmit}>
		<div class="columns">
			<div>
				<WalletPicker filterMissionControlZeroBalance bind:selectedWallet />

				<InputIcp {balance} fee={TOP_UP_NETWORK_FEES} bind:amount={icp} />
			</div>

			<GridArrow small />

			<div class="column-cycles">
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

		<button disabled={isNullish(selectedWallet) || isNullish(cycles)} type="submit"
			>{$i18n.core.review}</button
		>
	</form>
{/if}

<style lang="scss">
	@use '../../../styles/mixins/media';
	@use '../../../styles/mixins/grid';

	.columns {
		@include media.min-width(large) {
			@include grid.two-columns-with-arrow;
		}
	}

	.column-cycles {
		@include media.min-width(large) {
			display: flex;
			flex-direction: column;
			justify-content: center;

			padding: 0 0 var(--padding-3x);
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
