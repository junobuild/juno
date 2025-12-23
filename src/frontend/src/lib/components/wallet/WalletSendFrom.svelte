<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Wallet from '$lib/components/wallet/Wallet.svelte';
	import { icpToUsd, icpToUsdDefined } from '$lib/derived/wallet/exchange.derived';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';
	import { formatICP, formatICPToUsd } from '$lib/utils/icp.utils';

	interface Props {
		selectedWallet: SelectedWallet;
		balance: bigint | undefined;
	}

	let { selectedWallet, balance }: Props = $props();

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
			<p class="identifier">
				{walletName}
			</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.wallet.wallet_id}
			{/snippet}
			<p class="identifier">
				<Identifier identifier={walletIdText} shorten={false} />
			</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.wallet.account_identifier}
			{/snippet}
			<p class="identifier">
				<Identifier identifier={accountIdentifier?.toHex() ?? ''} />
			</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.wallet.balance}
			{/snippet}
			<p>
				{#if nonNullish(balance)}
					<span>{formatICP(balance)} <small>ICP</small></span>

					{#if nonNullish($icpToUsd) && $icpToUsdDefined}
						<span class="usd">{formatICPToUsd({ icp: balance, icpToUsd: $icpToUsd })}</span>
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
