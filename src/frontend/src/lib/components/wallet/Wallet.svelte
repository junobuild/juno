<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { getAccountIdentifier } from '$lib/api/icp-index.api';
	import ReceiveTokens from '$lib/components/tokens/ReceiveTokens.svelte';
	import Transactions from '$lib/components/transactions/Transactions.svelte';
	import TransactionsExport from '$lib/components/transactions/TransactionsExport.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletBalance from '$lib/components/wallet/WalletBalance.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import { PAGINATION } from '$lib/constants/constants';
	import { MISSION_CONTROL_v0_0_12 } from '$lib/constants/version.constants';
	import { authSignedIn, authSignedOut } from '$lib/derived/auth.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { loadNextTransactions } from '$lib/services/wallet.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { IcTransactionUi } from '$lib/types/ic-transaction';
	import { emit } from '$lib/utils/events.utils';
	import { last } from '$lib/utils/utils';

	interface Props {
		missionControlId: Principal;
	}

	let { missionControlId }: Props = $props();

	const accountIdentifier = getAccountIdentifier(missionControlId);

	/**
	 * Wallet
	 */
	let balance: bigint | undefined = $state(undefined);
	let transactions: IcTransactionUi[] = $state([]);

	let transactionsLoaded: IcTransactionUi[] = $state([]);
	let transactionsNext: IcTransactionUi[] = $state([]);

	$effect(() => {
		transactions = [...transactionsLoaded, ...transactionsNext];
	});

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

		const lastId = last(transactions)?.id;

		if (isNullish(lastId)) {
			// No transactions, we do nothing here and wait for the worker to post the first transactions
			return;
		}

		await loadNextTransactions({
			owner: missionControlId,
			identity: $authStore.identity,
			maxResults: PAGINATION,
			start: lastId,
			signalEnd: () => (disableInfiniteScroll = true),
			loadTransactions: (txs) =>
				(transactionsNext = [
					...transactionsNext.filter(({ id }) => !txs.some(({ id: txId }) => txId === id)),
					...txs
				])
		});
	};

	/**
	 * Actions
	 */

	let receiveVisible = $state(false);

	const openReceive = () => (receiveVisible = true);

	const openSend = () => {
		if (isNullish(balance)) {
			toasts.show({ text: $i18n.wallet.balance_not_loaded, level: 'info' });
			return;
		}

		if (balance <= 0n) {
			toasts.show({ text: $i18n.wallet.balance_zero, level: 'info' });
			return;
		}

		if (compare($missionControlVersion?.current ?? '0.0.0', MISSION_CONTROL_v0_0_12) <= 0) {
			toasts.warn($i18n.wallet.wallet_upgrade);
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'send_tokens',
				detail: {
					balance
				}
			}
		});
	};
</script>

{#if $authSignedIn}
	<WalletLoader {missionControlId} bind:balance bind:transactions={transactionsLoaded}>
		<div class="card-container with-title">
			<span class="title">{$i18n.wallet.overview}</span>

			<div class="columns-3 fit-column-1">
				<div>
					<Value>
						{#snippet label()}
							{$i18n.wallet.wallet_id}
						{/snippet}
						<Identifier shorten={false} small={false} identifier={missionControlId.toText()} />
					</Value>

					<Value>
						{#snippet label()}
							{$i18n.wallet.account_identifier}
						{/snippet}
						<Identifier identifier={accountIdentifier?.toHex() ?? ''} small={false} />
					</Value>
				</div>

				<div>
					<WalletBalance {balance} />
				</div>
			</div>
		</div>

		<div class="toolbar">
			<button onclick={openReceive}>{$i18n.wallet.receive}</button>

			<button onclick={openSend}>{$i18n.wallet.send}</button>
		</div>

		<Transactions {transactions} {disableInfiniteScroll} {missionControlId} {onintersect} />

		<TransactionsExport {transactions} {missionControlId} />
	</WalletLoader>
{/if}

<ReceiveTokens bind:visible={receiveVisible} {missionControlId} />
