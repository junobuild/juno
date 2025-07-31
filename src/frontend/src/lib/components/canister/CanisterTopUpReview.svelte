<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import CanisterTopUpCycles from '$lib/components/canister/CanisterTopUpCycles.svelte';
	import Segment from '$lib/components/segments/Segment.svelte';
	import SendTokensAmount from '$lib/components/tokens/SendTokensAmount.svelte';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletSendFrom from '$lib/components/wallet/WalletSendFrom.svelte';
	import { TOP_UP_NETWORK_FEES } from '$lib/constants/app.constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import { formatICP } from '$lib/utils/icp.utils';
	import { amountToICPToken } from '$lib/utils/token.utils';

	interface Props {
		balance: bigint;
		segment: CanisterSegmentWithLabel;
		icp: string | undefined;
		cycles: number | undefined;
		onback: () => void;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let { balance, onsubmit, onback, segment, icp, cycles }: Props = $props();

	let token: TokenAmountV2 | undefined = $derived(amountToICPToken(icp));
</script>

<h2>{$i18n.canisters.top_up}</h2>

<p>{$i18n.canisters.review_and_confirm_top_up}</p>

<form {onsubmit}>
	<div class="columns">
		{#if nonNullish($missionControlIdDerived)}
			<WalletSendFrom {balance} missionControlId={$missionControlIdDerived} />
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
				<SendTokensAmount {token} />

				<Value>
					{#snippet label()}
						{$i18n.core.fee}
					{/snippet}

					<p>
						<span>{formatICP(TOP_UP_NETWORK_FEES)} <small>ICP</small></span>
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
	@use '../../styles/mixins/grid';

	.columns {
		@include grid.two-columns-with-arrow;
	}
</style>
