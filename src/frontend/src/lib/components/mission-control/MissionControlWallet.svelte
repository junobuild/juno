<script lang="ts">
	import type { TransactionWithId } from '@dfinity/ledger-icp';
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getCredits } from '$lib/api/console.api';
	import { getAccountIdentifier, getTransactions } from '$lib/api/icp-index.api';
	import Wallet from '$lib/components/core/Wallet.svelte';
	import ReceiveTokens from '$lib/components/tokens/ReceiveTokens.svelte';
	import Transactions from '$lib/components/transactions/Transactions.svelte';
	import TransactionsExport from '$lib/components/transactions/TransactionsExport.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { PAGINATION } from '$lib/constants/constants';
	import { authSignedInStore, authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import { emit } from '$lib/utils/events.utils';
	import { formatE8sCredits, formatE8sICP } from '$lib/utils/icp.utils';
	import { last } from '$lib/utils/utils';

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

	let receiveVisible = false;

	const openReceive = () => (receiveVisible = true);

	const openSend = () => {
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

	let send = false;
	$: send =
		nonNullish(balance) &&
		balance > 0n &&
		compare($versionStore?.missionControl?.current ?? '0.0.0', '0.0.12') > 0;
</script>

{#if $authSignedInStore}
	<Wallet {missionControlId} bind:balance bind:transactions>
		<div class="card-container with-title">
			<span class="title">{$i18n.wallet.overview}</span>

			<div class="columns-3 fit-column-1">
				<div>
					<Value>
						<svelte:fragment slot="label">{$i18n.wallet.wallet_id}</svelte:fragment>
						<Identifier shorten={false} small={false} identifier={missionControlId.toText()} />
					</Value>

					<Value>
						<svelte:fragment slot="label">{$i18n.wallet.account_identifier}</svelte:fragment>
						<Identifier identifier={accountIdentifier?.toHex() ?? ''} small={false} />
					</Value>
				</div>

				<div>
					<Value>
						<svelte:fragment slot="label">{$i18n.wallet.balance}</svelte:fragment>
						<p>
							{#if nonNullish(balance)}<span in:fade
									>{formatE8sICP(balance)} <small>ICP</small></span
								>{:else}<span class="skeleton"><SkeletonText /></span>{/if}
						</p>
					</Value>

					<div class="credits">
						<Value>
							<svelte:fragment slot="label">{$i18n.wallet.credits}</svelte:fragment>
							<p>
								{#if nonNullish(credits)}<span in:fade>{formatE8sCredits(credits)}</span>{/if}
							</p>
						</Value>
					</div>
				</div>
			</div>
		</div>

		<div class="toolbar">
			<button on:click={openReceive}>{$i18n.wallet.receive}</button>

			{#if send}
				<button in:fade on:click={openSend}>{$i18n.wallet.send}</button>
			{/if}
		</div>

		<Transactions
			{transactions}
			{disableInfiniteScroll}
			{missionControlId}
			on:junoIntersect={onIntersect}
		/>

		<TransactionsExport {transactions} {missionControlId} />
	</Wallet>
{/if}

<ReceiveTokens bind:visible={receiveVisible} {missionControlId} />

<style lang="scss">
	p {
		min-height: 24px;
	}

	.skeleton {
		display: block;
		padding: var(--padding-0_5x) 0 0;
		max-width: 150px;
	}

	.credits {
		padding: var(--padding) 0 0;
	}
</style>
