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
	import { onMount } from 'svelte';
	import { getAccountIdentifier, getTransactions } from '$lib/api/icp-index.api';
	import { getCredits } from '$lib/api/console.api';
	import { toasts } from '$lib/stores/toasts.store';
	import Transactions from '$lib/components/transactions/Transactions.svelte';
	import { PAGINATION } from '$lib/constants/constants';
	import TransactionsExport from '$lib/components/transactions/TransactionsExport.svelte';
	import { fade } from 'svelte/transition';
	import type { TransactionWithId } from '@dfinity/ledger-icp';
	import Wallet from '$lib/components/core/Wallet.svelte';
	import { emit } from '$lib/utils/events.utils';

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
	 * Wallet
	 */
	let balance: bigint | undefined = undefined;
	let transactions: TransactionWithId[] = [];

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

	onMount(async () => await loadCredits());

	/**
	 * Actions
	 */

	const openModal = () => {
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

{#if $authSignedInStore}
	<Wallet {missionControlId} bind:balance bind:transactions>
		<div class="card-container with-title">
			<span class="title">{$i18n.wallet.overview}</span>

			<div class="columns-3">
				<div>
					<Value>
						<svelte:fragment slot="label">{$i18n.wallet.wallet_id}</svelte:fragment>
						<p>
							<Identifier shorten={false} identifier={missionControlId.toText()} />
						</p>
					</Value>

					<Value>
						<svelte:fragment slot="label">{$i18n.wallet.account_identifier}</svelte:fragment>
						<p>
							<Identifier identifier={accountIdentifier?.toHex() ?? ''} />
						</p>
					</Value>

					<Value>
						<svelte:fragment slot="label">{$i18n.wallet.balance}</svelte:fragment>
						<p>
							{#if nonNullish(balance)}<span in:fade
									>{formatE8sICP(balance)} <small>ICP</small></span
								>{/if}
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
		</div>

		{#if balance > 0n}
			<button in:fade on:click={openModal}>{$i18n.wallet.send}</button>
		{/if}

		<Transactions
			{transactions}
			{disableInfiniteScroll}
			{missionControlId}
			on:junoIntersect={onIntersect}
		/>

		<TransactionsExport {transactions} {missionControlId} />
	</Wallet>
{/if}

<style lang="scss">
	p {
		min-height: 24px;
	}
</style>
