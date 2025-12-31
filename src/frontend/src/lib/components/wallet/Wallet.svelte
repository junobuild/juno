<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import { Principal } from '@icp-sdk/core/principal';
	import WalletActions from '$lib/components/wallet/WalletActions.svelte';
	import WalletBalanceById from '$lib/components/wallet/WalletBalanceById.svelte';
	import WalletIds from '$lib/components/wallet/WalletIds.svelte';
	import WalletPicker from '$lib/components/wallet/WalletPicker.svelte';
	import WalletTokenPicker from '$lib/components/wallet/WalletTokenPicker.svelte';
	import ReceiveTokens from '$lib/components/wallet/tokens/ReceiveTokens.svelte';
	import Transactions from '$lib/components/wallet/transactions/Transactions.svelte';
	import TransactionsExport from '$lib/components/wallet/transactions/TransactionsExport.svelte';
	import { PAGINATION } from '$lib/constants/app.constants';
	import { CYCLES } from '$lib/constants/token.constants';
	import { authSignedIn, authSignedOut } from '$lib/derived/auth.derived';
	import { transactions } from '$lib/derived/wallet/transactions.derived';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { loadNextTransactions } from '$lib/services/wallet/wallet.transactions.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { last } from '$lib/utils/utils';

	let selectedWallet = $state<SelectedWallet | undefined>(undefined);

	let selectedToken = $state<SelectedToken>(CYCLES);

	let walletIdText = $derived(
		nonNullish(selectedWallet) ? encodeIcrcAccount(selectedWallet.walletId) : undefined
	);

	let walletTransactions = $derived(
		nonNullish(walletIdText) ? ($transactions[walletIdText]?.[selectedToken.ledgerId] ?? []) : []
	);

	/**
	 * Scroll
	 */

	let disableInfiniteScroll = $state(false);

	const onintersect = async () => {
		if ($authSignedOut) {
			toasts.error({
				text: $i18n.errors.no_identity
			});
			return;
		}

		const lastId = last(walletTransactions)?.data.id;

		if (isNullish(lastId)) {
			// No transactions, we do nothing here and wait for the worker to post the first transactions
			return;
		}

		if (isNullish(selectedWallet)) {
			// For simplicity reasons. If walletId is undefined then transactions is an empty array then intersection
			// likely cannot happen.
			return;
		}

		await loadNextTransactions({
			account: selectedWallet.walletId,
			ledgerId: Principal.fromText(selectedToken.ledgerId),
			indexId: Principal.fromText(selectedToken.indexId),
			maxResults: PAGINATION,
			start: lastId,
			signalEnd: () => (disableInfiniteScroll = true)
		});
	};

	let receiveVisible = $state(false);
</script>

{#if $authSignedIn}
	<div class="card-container with-title">
		<span class="title">{$i18n.wallet.overview}</span>

		<div class="columns-3 fit-column-1">
			<div>
				<WalletPicker bind:selectedWallet />

				<WalletTokenPicker {selectedWallet} bind:selectedToken />

				{#if nonNullish(selectedWallet)}
					<WalletIds {selectedWallet} />
				{/if}
			</div>

			<div>
				<WalletBalanceById {selectedToken} {selectedWallet} />
			</div>
		</div>
	</div>

	{#if nonNullish(selectedWallet)}
		<WalletActions onreceive={() => (receiveVisible = true)} {selectedToken} {selectedWallet} />

		<Transactions
			{disableInfiniteScroll}
			{onintersect}
			{selectedWallet}
			transactions={walletTransactions}
		/>

		<TransactionsExport {selectedWallet} transactions={walletTransactions} />
	{/if}
{/if}

{#if nonNullish(selectedWallet)}
	<ReceiveTokens {selectedWallet} bind:visible={receiveVisible} />
{/if}

