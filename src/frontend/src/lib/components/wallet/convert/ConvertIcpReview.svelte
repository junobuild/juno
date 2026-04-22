<script lang="ts">
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletSendFrom from '$lib/components/wallet/WalletSendFrom.svelte';
	import SendTokensAmount from '$lib/components/wallet/tokens/SendTokensAmount.svelte';
	import TokenSymbol from '$lib/components/wallet/tokens/TokenSymbol.svelte';
	import { ICP } from '$lib/constants/token.constants';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { amountToToken, formatToken } from '$lib/utils/token.utils';

	interface Props {
		selectedWallet: SelectedWallet;
		balance: bigint;
		amount: string | undefined;
		displayTCycles: string | undefined;
		onback: () => void;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let { selectedWallet, balance, onsubmit, onback, amount, displayTCycles }: Props = $props();

	const selectedToken = ICP;

	let token = $derived(amountToToken({ amount, token: ICP.token }));
</script>

<h2>{$i18n.wallet.convert_title}</h2>

<p>{$i18n.wallet.convert_review_and_confirm}</p>

<form {onsubmit}>
	<div class="columns">
		<WalletSendFrom {balance} {selectedToken} {selectedWallet} />

		<GridArrow />

		<div class="card-container with-title primary">
			<span class="title">{$i18n.core.to}</span>

			<div class="content">
				<Value>
					{#snippet label()}
						{$i18n.wallet.destination}
					{/snippet}

					<p class="identifier">
						<Identifier identifier={encodeIcrcAccount(selectedWallet.walletId)} />
					</p>
				</Value>
			</div>
		</div>

		<div class="card-container with-title tertiary">
			<span class="title">{$i18n.wallet.converting}</span>

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

				<Value>
					{#snippet label()}
						{$i18n.canisters.converted_cycles}
					{/snippet}

					<p>{displayTCycles ?? '0'} <small>TCycles</small></p>
				</Value>
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

	.identifier {
		margin: 0 0 var(--padding);
	}
</style>
