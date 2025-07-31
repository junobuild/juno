<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import ReceiveTokens from '$lib/components/tokens/ReceiveTokens.svelte';
	import Transactions from '$lib/components/transactions/Transactions.svelte';
	import TransactionsExport from '$lib/components/transactions/TransactionsExport.svelte';
	import WalletActions from '$lib/components/wallet/WalletActions.svelte';
	import WalletBalance from '$lib/components/wallet/WalletBalance.svelte';
	import WalletIds from '$lib/components/wallet/WalletIds.svelte';
	import { PAGINATION } from '$lib/constants/app.constants';
	import { authSignedIn, authSignedOut } from '$lib/derived/auth.derived';
	import { balance } from '$lib/derived/balance.derived';
	import { transactions } from '$lib/derived/transactions.derived';
	import { loadNextTransactions } from '$lib/services/wallet/wallet.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { last } from '$lib/utils/utils';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

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

		const lastId = last($transactions)?.data.id;

		if (isNullish(lastId)) {
			// No transactions, we do nothing here and wait for the worker to post the first transactions
			return;
		}

		await loadNextTransactions({
			owner: missionControlId,
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
				<WalletIds {missionControlId} />
			</div>

			<div>
				<WalletBalance balance={$balance} />
			</div>
		</div>
	</div>

	<WalletActions {missionControlId} onreceive={() => (receiveVisible = true)} />

	<Transactions
		{disableInfiniteScroll}
		{missionControlId}
		{onintersect}
		transactions={$transactions}
	/>

	<TransactionsExport {missionControlId} transactions={$transactions} />
{/if}

<ReceiveTokens {missionControlId} bind:visible={receiveVisible} />
