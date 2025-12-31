<script lang="ts">
	import { ICPToken, nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import CanisterTopUpCycles from '$lib/components/canister/top-up/CanisterTopUpCycles.svelte';
	import Segment from '$lib/components/segments/Segment.svelte';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletSendFrom from '$lib/components/wallet/WalletSendFrom.svelte';
	import SendTokensAmount from '$lib/components/wallet/tokens/SendTokensAmount.svelte';
	import { ICP_TOP_UP_FEE } from '$lib/constants/app.constants';
	import { ICP_TOKEN } from '$lib/constants/wallet.constants';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import { formatICP } from '$lib/utils/icp.utils';
	import { amountToToken } from '$lib/utils/token.utils';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
		balance: bigint;
		segment: CanisterSegmentWithLabel;
		icp: string | undefined;
		cycles: bigint | undefined;
		onback: () => void;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let { selectedWallet, balance, onsubmit, onback, segment, icp, cycles }: Props = $props();

	let token: TokenAmountV2 | undefined = $derived(amountToToken({ amount: icp, token: ICPToken }));
</script>

<h2>{$i18n.canisters.top_up}</h2>

<p>{$i18n.canisters.review_and_confirm_top_up}</p>

<form {onsubmit}>
	<div class="columns">
		{#if nonNullish(selectedWallet)}
			<WalletSendFrom {balance} selectedToken={ICP_TOKEN} {selectedWallet} />
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
				<SendTokensAmount selectedToken={ICP_TOKEN} {token} />

				<Value>
					{#snippet label()}
						{$i18n.core.fee}
					{/snippet}

					<p>
						<span>{formatICP(ICP_TOP_UP_FEE)} <small>ICP</small></span>
					</p>
				</Value>

				<CanisterTopUpCycles {cycles} />
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
