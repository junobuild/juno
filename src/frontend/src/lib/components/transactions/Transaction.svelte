<script lang="ts">
	import type { TransactionWithId, Transaction } from '@dfinity/ledger-icp';
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { formatToDate } from '$lib/utils/date.utils';
	import {
		transactionAmount,
		transactionFrom,
		transactionMemo,
		transactionTimestamp,
		transactionTo
	} from '$lib/utils/wallet.utils';

	interface Props {
		missionControlId: Principal;
		transactionWithId: TransactionWithId;
	}

	let { missionControlId, transactionWithId }: Props = $props();

	let id: bigint = $state();
	let transaction: Transaction = $state();

	run(() => {
		({ id, transaction } = transactionWithId);
	});

	let from: string = $derived(transactionFrom(transaction));

	let to: string = $derived(transactionTo(transaction));

	let timestamp: bigint | undefined = $derived(transactionTimestamp(transaction));

	let memo: string = $derived(transactionMemo({ transaction, missionControlId }));

	let amount: string | undefined = $derived(transactionAmount(transaction));
</script>

<tr in:fade>
	<td class="id">{`${id}`}</td>
	<td class="timestamp">
		{#if nonNullish(timestamp)}
			{formatToDate(timestamp)}
		{/if}
	</td>
	<td class="from">
		<Identifier small={false} identifier={from} />
	</td>
	<td class="to">
		<Identifier small={false} identifier={to} />
	</td>
	<td class="memo">{memo}</td>
	<td class="amount">
		{#if nonNullish(amount)}
			{amount} <small>ICP</small>
		{/if}
	</td>
</tr>

<style lang="scss">
	@use '../../styles/mixins/media';

	.id,
	.timestamp,
	.memo {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}
</style>
