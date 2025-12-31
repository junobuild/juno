<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import Segment from '$lib/components/segments/Segment.svelte';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletSendFrom from '$lib/components/wallet/WalletSendFrom.svelte';
	import SendTokensAmount from '$lib/components/wallet/tokens/SendTokensAmount.svelte';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import { amountToToken, formatToken, isTokenIcp } from '$lib/utils/token.utils';
	import TokenSymbol from '$lib/components/wallet/tokens/TokenSymbol.svelte';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
		selectedToken: SelectedToken;
		balance: bigint;
		segment: CanisterSegmentWithLabel;
		amount: string | undefined;
		displayTCycles: string | undefined;
		onback: () => void;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let {
		selectedWallet,
		selectedToken,
		balance,
		onsubmit,
		onback,
		segment,
		amount,
		displayTCycles
	}: Props = $props();

	let token = $derived(amountToToken({ amount, token: selectedToken.token }));
</script>

<h2>{$i18n.canisters.top_up}</h2>

<p>{$i18n.canisters.review_and_confirm_top_up}</p>

<form {onsubmit}>
	<div class="columns">
		{#if nonNullish(selectedWallet)}
			<WalletSendFrom {balance} {selectedToken} {selectedWallet} />
		{/if}

		<GridArrow />

		<div class="card-container with-title primary">
			<span class="title">{$i18n.core.to}</span>

			<div class="content">
				<Value>
					{#snippet label()}
						{$i18n.wallet.destination}
					{/snippet}

					<p class="identifier">
						<Segment id={Principal.fromText(segment.canisterId)}>
							{segment.label}
						</Segment>
					</p>
				</Value>
			</div>
		</div>

		<div class="card-container with-title tertiary">
			<span class="title">{$i18n.canisters.topping_up}</span>

			<div class="content">
				<SendTokensAmount {selectedToken} {token} />

				<Value>
					{#snippet label()}
						{$i18n.core.fee}
					{/snippet}

					<p>
						<span
							>{formatToken({ selectedToken, amount: selectedToken.fees.topUp })}
							<TokenSymbol {selectedToken} /></span
						>
					</p>
				</Value>

				{#if isTokenIcp(selectedToken)}
					<Value>
						{#snippet label()}
							{$i18n.canisters.converted_cycles}
						{/snippet}

						<p>{displayTCycles ?? '0'} <small>TCycles</small></p>
					</Value>
				{/if}
			</div>
		</div>
	</div>

	<div class="toolbar">
		<button onclick={onback} type="button">{$i18n.core.back}</button>
		<button type="submit">{$i18n.core.confirm}</button>
	</div>
</form>

<style lang="scss">
	@use '../../../styles/mixins/grid';

	.columns {
		@include grid.two-columns-with-arrow;
	}
</style>
