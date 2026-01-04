<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletBalanceUsd from '$lib/components/wallet/balance/WalletBalanceUsd.svelte';
	import TokenSymbol from '$lib/components/wallet/tokens/TokenSymbol.svelte';
	import { icpToUsd, icpToUsdDefined } from '$lib/derived/wallet/exchange.derived';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';
	import { formatToken } from '$lib/utils/token.utils';

	interface Props {
		selectedWallet: SelectedWallet;
		selectedToken: SelectedToken;
		balance: bigint | undefined;
	}

	let { selectedWallet, selectedToken, balance }: Props = $props();

	let { walletId } = $derived(selectedWallet);

	let walletIdText = $derived(encodeIcrcAccount(walletId));

	let accountIdentifier = $derived(toAccountIdentifier(walletId));

	let walletName = $derived(
		selectedWallet.type === 'mission_control' ? $i18n.mission_control.title : $i18n.wallet.dev
	);
</script>

<div class="card-container with-title from">
	<span class="title">{$i18n.core.from}</span>

	<div class="content">
		<Value>
			{#snippet label()}
				{$i18n.wallet.title}
			{/snippet}
			<p>
				{walletName}
			</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.wallet.wallet_id}
			{/snippet}
			<Identifier identifier={walletIdText} shorten={false} small={false} />
		</Value>

		{#if selectedWallet.type === 'mission_control'}
			<Value>
				{#snippet label()}
					{$i18n.wallet.account_identifier}
				{/snippet}
				<Identifier identifier={accountIdentifier?.toHex() ?? ''} small={false} />
			</Value>
		{/if}

		<Value>
			{#snippet label()}
				{$i18n.wallet.balance}
			{/snippet}
			<p>
				{#if nonNullish(balance)}
					<span
						>{formatToken({ selectedToken, amount: balance })} <TokenSymbol {selectedToken} /></span
					>

					{#if nonNullish($icpToUsd) && $icpToUsdDefined}
						<span class="usd"><WalletBalanceUsd {balance} {selectedToken} /></span>
					{/if}
				{/if}
			</p>
		</Value>
	</div>
</div>

<style lang="scss">
	.from {
		grid-row-start: 1;
		grid-row-end: 3;
	}

	.usd {
		display: block;
		font-size: var(--font-size-small);
	}
</style>
