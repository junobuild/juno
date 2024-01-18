<script lang="ts">
	import { authSignedInStore, authStore } from '$lib/stores/auth.store';
	import type { Principal } from '@dfinity/principal';
	import { formatE8sCredits, formatE8sICP } from '$lib/utils/icp.utils';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { last } from '$lib/utils/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import QRCodeContainer from '$lib/components/ui/QRCodeContainer.svelte';
	import type { WalletWorker } from '$lib/services/worker.wallet.services';
	import { onDestroy, onMount } from 'svelte';
	import { initWalletWorker } from '$lib/services/worker.wallet.services';
	import type { PostMessageDataResponse } from '$lib/types/post-message';
	import { getAccountIdentifier, getTransactions } from '$lib/api/ledger.api';
	import { getCredits } from '$lib/api/console.api';
	import { toasts } from '$lib/stores/toasts.store';
	import type { TransactionWithId } from '@junobuild/ledger';
	import Transactions from '$lib/components/transactions/Transactions.svelte';
	import { jsonReviver } from '@dfinity/utils';
	import { PAGINATION } from '$lib/constants/constants';
	import TransactionsExport from '$lib/components/transactions/TransactionsExport.svelte';
	import { fade } from 'svelte/transition';

	export let missionControlId: Principal;

	const accountIdentifier = getAccountIdentifier(missionControlId);
	let credits: bigint | undefined;

	/**
	 * Credits
	 */

	const loadCredits = async () => {
		try {
			credits = await getCredits($authStore.identity);
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.load_credits,
				detail: err
			});
		}
	};

	/**
	 * Web Worker
	 */

	let worker: WalletWorker | undefined;

	let balance: bigint | undefined = undefined;
	let transactions: TransactionWithId[] = [];

	const syncState = (data: PostMessageDataResponse) => {
		if (isNullish(data.wallet)) {
			return;
		}

		balance = data.wallet.balance;
		transactions = [...JSON.parse(data.wallet.newTransactions, jsonReviver), ...transactions];
	};

	const initWorker = async () => (worker = await initWalletWorker());

	$: worker,
		missionControlId,
		(async () => {
			if (isNullish(missionControlId)) {
				worker?.stop();
				return;
			}

			worker?.start({
				missionControlId,
				callback: syncState
			});
		})();

	/**
	 * Scroll
	 */

	let disableInfiniteScroll = false;

	const onIntersect = async () => {
		if (!$authSignedInStore) {
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

		try {
			const { transactions: nextTransactions } = await getTransactions({
				owner: missionControlId,
				identity: $authStore.identity,
				maxResults: PAGINATION,
				start: lastId
			});

			if (nextTransactions.length === 0) {
				disableInfiniteScroll = true;
				return;
			}

			transactions = [...transactions, ...nextTransactions];
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.transactions_next,
				detail: err
			});

			disableInfiniteScroll = true;
		}
	};

	/**
	 * Lifecycle
	 */

	onMount(async () => await Promise.all([initWorker(), loadCredits()]));
	onDestroy(() => worker?.stop());
</script>

{#if $authSignedInStore}
	<div class="card-container columns-3">
		<div>
			<Value>
				<svelte:fragment slot="label">{$i18n.wallet.account_identifier}</svelte:fragment>
				<p>
					<Identifier identifier={accountIdentifier?.toHex() ?? ''} />
				</p>
			</Value>

			<Value>
				<svelte:fragment slot="label">{$i18n.wallet.balance}</svelte:fragment>
				<p>
					{#if nonNullish(balance)}<span in:fade>{formatE8sICP(balance)} ICP</span>{/if}
				</p>
			</Value>

			<Value>
				<svelte:fragment slot="label">{$i18n.wallet.credits}</svelte:fragment>
				<p>
					{#if nonNullish(credits)}<span in:fade>{formatE8sCredits(credits)}</span>{/if}
				</p>
			</Value>
		</div>

		<div>
			{#if nonNullish(accountIdentifier)}
				<QRCodeContainer
					value={accountIdentifier.toHex()}
					ariaLabel={$i18n.wallet.account_identifier}
				/>
			{/if}
		</div>
	</div>

	<Transactions
		{transactions}
		{disableInfiniteScroll}
		{missionControlId}
		on:junoIntersect={onIntersect}
	/>

	<TransactionsExport {transactions} {missionControlId} />
{/if}

<style lang="scss">
	p {
		min-height: 24px;
	}
</style>
