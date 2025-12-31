<script lang="ts">
	import { isEmptyString, isNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import CanisterTopUpFormCycles from '$lib/components/canister/top-up/CanisterTopUpFormCycles.svelte';
	import CanisterTopUpFormIcp from '$lib/components/canister/top-up/CanisterTopUpFormIcp.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import WalletPicker from '$lib/components/wallet/WalletPicker.svelte';
	import WalletTokenPicker from '$lib/components/wallet/WalletTokenPicker.svelte';
	import { CYCLES } from '$lib/constants/token.constants';
	import {
		devCyclesBalanceOrZero,
		devIcpBalanceOrZero,
		missionControlCyclesBalanceOrZero,
		missionControlIcpBalanceOrZero
	} from '$lib/derived/wallet/balance.derived';
	import { icpToUsd } from '$lib/derived/wallet/exchange.derived';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatICPToHTML } from '$lib/utils/icp.utils';
	import { assertAndConvertAmountToToken, isTokenIcp } from '$lib/utils/token.utils';

	interface Props {
		intro?: Snippet;
		segment: CanisterSegmentWithLabel;
		selectedWallet: SelectedWallet | undefined;
		selectedToken: SelectedToken;
		balance: bigint;
		amount: string | undefined;
		displayTCycles: string | undefined;
		onreview: () => void;
		onclose: () => void;
	}

	let {
		onreview,
		intro,
		segment,
		selectedWallet = $bindable(undefined),
		selectedToken = $bindable(CYCLES),
		balance = $bindable(0n),
		onclose,
		amount = $bindable(undefined),
		displayTCycles = $bindable(undefined)
	}: Props = $props();

	$effect(() => {
		balance =
			selectedWallet?.type === 'mission_control'
				? isTokenIcp(selectedToken)
					? $missionControlIcpBalanceOrZero
					: $missionControlCyclesBalanceOrZero
				: isTokenIcp(selectedToken)
					? $devIcpBalanceOrZero
					: $devCyclesBalanceOrZero;
	});

	const onSubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		const { valid } = assertAndConvertAmountToToken({
			balance,
			amount,
			token: selectedToken.token,
			fee: selectedToken.fees.topUp
		});

		if (!valid) {
			return;
		}

		onreview();
	};

	let InputAmount = $derived(
		isTokenIcp(selectedToken) ? CanisterTopUpFormIcp : CanisterTopUpFormCycles
	);
</script>

{@render intro?.()}

<p>
	{i18nFormat(
		selectedWallet?.type === 'mission_control'
			? $i18n.canisters.icp_to_cycles_description
			: $i18n.canisters.cycles_description,
		[
			{
				placeholder: '{0}',
				value: segment.segment.replace('_', ' ')
			}
		]
	)}
	<Html
		text={i18nFormat($i18n.canisters.top_up_info, [
			{
				placeholder: '{0}',
				value: formatICPToHTML({ e8s: balance, bold: false, icpToUsd: $icpToUsd })
			}
		])}
	/>
</p>

<form onsubmit={onSubmit}>
	<WalletPicker filterMissionControlZeroBalance bind:selectedWallet />

	<WalletTokenPicker {selectedWallet} bind:selectedToken />

	<div class="group-cycles" class:icp={isTokenIcp(selectedToken)}>
		<InputAmount {balance} bind:amount bind:displayTCycles />
	</div>

	<button
		disabled={isNullish(selectedWallet) || isEmptyString(amount)}
		class:icp={isTokenIcp(selectedToken)}
		type="submit">{$i18n.core.review}</button
	>
</form>

<style lang="scss">
	@use '../../../styles/mixins/media';
	@use '../../../styles/mixins/grid';

	form {
		margin: var(--padding-4x) 0;

		@include media.min-width(large) {
			@include grid.two-columns;
		}
	}

	p {
		min-height: 24px;
	}

	.group-cycles {
		&.icp {
			@include media.min-width(large) {
				grid-column: 1 / 3;
			}
		}
	}

	button {
		&:not(.icp) {
			@include media.min-width(large) {
				grid-column-start: 1;
			}
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
