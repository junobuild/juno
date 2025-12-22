<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import ReceiveTokens from '$lib/components/tokens/ReceiveTokens.svelte';
	import Transactions from '$lib/components/transactions/Transactions.svelte';
	import TransactionsExport from '$lib/components/transactions/TransactionsExport.svelte';
	import WalletActions from '$lib/components/wallet/WalletActions.svelte';
	import WalletBalanceById from '$lib/components/wallet/WalletBalanceById.svelte';
	import WalletIds from '$lib/components/wallet/WalletIds.svelte';
	import WalletPicker from '$lib/components/wallet/WalletPicker.svelte';
	import { PAGINATION } from '$lib/constants/app.constants';
	import { authSignedIn, authSignedOut } from '$lib/derived/auth.derived';
	import { transactions } from '$lib/derived/wallet/transactions.derived';
	import type { WalletId } from '$lib/schemas/wallet.schema';
	import { loadNextTransactions } from '$lib/services/wallet/wallet.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { authStore } from '$lib/stores/auth.store';
	import { last } from '$lib/utils/utils';

	let walletId = $state<WalletId | undefined>(undefined);

	let walletIdText = $derived(nonNullish(walletId) ? encodeIcrcAccount(walletId) : undefined);

	let walletTransactions = $derived(
		nonNullish(walletIdText) ? ($transactions[walletIdText] ?? []) : []
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

		if (isNullish(walletId)) {
			// For simplicity reasons. If walletId is undefined then transactions is an empty array then intersection
			// likely cannot happen.
			return;
		}

		await loadNextTransactions({
			account: walletId,
			identity: $authStore.identity,
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
				<WalletPicker bind:walletId />

				{#if nonNullish(walletId)}
					<WalletIds {walletId} />
				{/if}
			</div>

			<div>
				<WalletBalanceById {walletId} />
			</div>
		</div>
	</div>

	{#if nonNullish(walletId)}
		<WalletActions onreceive={() => (receiveVisible = true)} {walletId} />

		<Transactions
			{disableInfiniteScroll}
			{onintersect}
			transactions={walletTransactions}
			{walletId}
		/>

		<TransactionsExport transactions={walletTransactions} {walletId} />
	{/if}
{/if}

{#if nonNullish(walletId)}
	<ReceiveTokens {walletId} bind:visible={receiveVisible} />
{/if}
